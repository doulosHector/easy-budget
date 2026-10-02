import { DEFAULT_CATEGORY_ICON, DEFAULT_GOAL_ICON } from '../constants/icons'
import { paletteColor } from '../constants/palette'
import type {
  BudgetState,
  Category,
  DateKey,
  Goal,
  MonthBudget,
} from '../types'
import { normalizeHeader, parseCsv, toCsv } from '../utils/csv'
import { isDateKey, isMonthKey, parseDeadline } from '../utils/date'
import { createId } from '../utils/id'
import { parseAmount } from '../utils/number'
import { compareExpensesDesc, findCategory } from './budget'
import { findGoal, getGoalHistory } from './goals'

export const EXPENSES_FILENAME = 'easy-budget-gastos.csv'
export const BUDGETS_FILENAME = 'easy-budget-presupuestos.csv'
export const GOALS_FILENAME = 'easy-budget-metas.csv'

const EXPENSE_HEADERS = ['fecha', 'categoria', 'concepto', 'monto']
const BUDGET_HEADERS = ['mes', 'disponible', 'tipo', 'nombre', 'presupuesto']
const GOAL_HEADERS = [
  'meta',
  'objetivo',
  'fecha_limite',
  'fecha',
  'tipo',
  'monto',
]

/** Values of the `tipo` column in the budgets file. */
const BUDGET_KIND = { category: 'categoria', goal: 'meta' } as const
/** Values of the `tipo` column in the goals file. */
const MOVEMENT_KIND = { in: 'aportacion', out: 'retiro' } as const

const money = (amount: number | null): string =>
  amount == null ? '' : amount.toFixed(2)

/** All expenses, oldest first. */
export const exportExpensesCsv = (state: BudgetState): string =>
  toCsv([
    EXPENSE_HEADERS,
    ...[...state.expenses]
      .sort((a, b) => -compareExpensesDesc(a, b))
      .map((e) => [
        e.date,
        findCategory(state.categories, e.categoryId)?.name ?? '',
        e.concept,
        e.amount.toFixed(2),
      ]),
  ])

/**
 * One row per month and category budget or goal plan (`tipo` tells them
 * apart), or a single row for months without any.
 */
export const exportBudgetsCsv = (state: BudgetState): string => {
  const rows: string[][] = [BUDGET_HEADERS]
  for (const month of Object.keys(state.months).sort()) {
    const { available, budgets, goals } = state.months[month]
    const prefix = [month, money(available)]
    const monthRows = [
      ...Object.entries(budgets).flatMap(([id, amount]) => {
        const category = findCategory(state.categories, id)
        return category
          ? [[BUDGET_KIND.category, category.name, money(amount)]]
          : []
      }),
      ...Object.entries(goals).flatMap(([id, amount]) => {
        const goal = findGoal(state.goals, id)
        return goal ? [[BUDGET_KIND.goal, goal.name, money(amount)]] : []
      }),
    ]
    if (!monthRows.length) rows.push([...prefix, '', '', ''])
    for (const row of monthRows) rows.push([...prefix, ...row])
  }
  return toCsv(rows)
}

/**
 * One row per goal movement, oldest first, with `monto` always positive and
 * `tipo` telling contributions from withdrawals. A goal without movements
 * still gets one row, so it is not lost.
 */
export const exportGoalsCsv = (state: BudgetState): string => {
  const rows: string[][] = [GOAL_HEADERS]
  for (const goal of state.goals) {
    const prefix = [goal.name, money(goal.target), goal.deadline ?? '']
    const history = getGoalHistory(state.contributions, goal.id).reverse()
    if (!history.length) rows.push([...prefix, '', '', ''])
    for (const { date, amount } of history) {
      rows.push([
        ...prefix,
        date,
        amount > 0 ? MOVEMENT_KIND.in : MOVEMENT_KIND.out,
        money(Math.abs(amount)),
      ])
    }
  }
  return toCsv(rows)
}

export type ImportResult =
  | { kind: 'expenses'; added: number; skipped: number }
  | { kind: 'budgets'; rows: number }
  | { kind: 'goals'; goals: number; added: number; skipped: number }
  | { kind: 'empty' }
  | { kind: 'unknown' }

const findOrCreateCategory = (
  draft: BudgetState,
  rawName: string,
): Category | null => {
  const name = rawName.trim()
  if (!name) return null
  const existing = draft.categories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  )
  if (existing) return existing
  const category: Category = {
    id: createId(),
    name,
    icon: DEFAULT_CATEGORY_ICON,
    color: paletteColor(draft.categories.length),
  }
  draft.categories.push(category)
  return category
}

/**
 * Finds a goal by name (case-insensitive) or creates it. An existing goal
 * gets the target or deadline it was missing.
 */
const findOrCreateGoal = (
  draft: BudgetState,
  name: string,
  details: { target?: number | null; deadline?: DateKey | null } = {},
): { goal: Goal; created: boolean } => {
  const target = details.target ?? null
  const deadline = details.deadline ?? null
  const existing = draft.goals.find(
    (g) => g.name.toLowerCase() === name.toLowerCase(),
  )
  if (existing) {
    existing.target ??= target
    existing.deadline ??= deadline
    return { goal: existing, created: false }
  }
  const goal: Goal = {
    id: createId(),
    name,
    target,
    deadline,
    icon: DEFAULT_GOAL_ICON,
    color: paletteColor(draft.goals.length),
    createdAt: Date.now(),
  }
  draft.goals.push(goal)
  return { goal, created: true }
}

const ensureMonth = (draft: BudgetState, month: string): MonthBudget =>
  (draft.months[month] ??= { available: null, budgets: {}, goals: {} })

/**
 * Imports a CSV previously exported by the app (expenses, budgets or goals).
 * Unknown categories and goals are created; duplicated expenses and goal
 * movements are skipped.
 * Returns a new state, leaving the given one untouched.
 */
export const importCsv = (
  state: BudgetState,
  text: string,
): { state: BudgetState; result: ImportResult } => {
  const rows = parseCsv(text)
  if (rows.length < 2) return { state, result: { kind: 'empty' } }

  const headers = rows[0].map(normalizeHeader)
  const column = (name: string) => headers.indexOf(name)
  const cell = (row: string[], index: number) =>
    index >= 0 ? (row[index] ?? '').trim() : ''
  const draft = structuredClone(state)

  // Checked first: a goals file also has `fecha` and `monto` columns.
  if (column('meta') >= 0 && column('monto') >= 0) {
    const [name, target, deadline, date, kind, amount] =
      GOAL_HEADERS.map(column)
    const created = new Set<string>()
    let added = 0
    let skipped = 0
    for (const row of rows.slice(1)) {
      const goalName = cell(row, name)
      if (!goalName) {
        skipped++
        continue
      }
      const targetValue = parseAmount(cell(row, target))
      const deadlineText = cell(row, deadline)
      const { goal, created: isNew } = findOrCreateGoal(draft, goalName, {
        target: targetValue > 0 ? targetValue : null,
        deadline: parseDeadline(deadlineText),
      })
      if (isNew) created.add(goal.id)

      const movementDate = cell(row, date)
      const amountText = cell(row, amount)
      // A row without a movement only carries the goal itself.
      if (!movementDate && !amountText) continue
      const value = parseAmount(amountText)
      const movementKind = normalizeHeader(cell(row, kind))
      if (
        !isDateKey(movementDate) ||
        value <= 0 ||
        (movementKind !== MOVEMENT_KIND.in &&
          movementKind !== MOVEMENT_KIND.out)
      ) {
        skipped++
        continue
      }
      const signed = movementKind === MOVEMENT_KIND.out ? -value : value
      const duplicated = draft.contributions.some(
        (c) =>
          c.goalId === goal.id &&
          c.date === movementDate &&
          Math.abs(c.amount - signed) < 0.005,
      )
      if (duplicated) {
        skipped++
        continue
      }
      draft.contributions.push({
        id: createId(),
        goalId: goal.id,
        amount: signed,
        date: movementDate,
        createdAt: Date.now(),
      })
      added++
    }
    return {
      state: draft,
      result: { kind: 'goals', goals: created.size, added, skipped },
    }
  }

  if (column('fecha') >= 0 && column('monto') >= 0) {
    const [date, category, concept, amount] = EXPENSE_HEADERS.map(column)
    let added = 0
    let skipped = 0
    for (const row of rows.slice(1)) {
      const expenseDate = cell(row, date)
      const value = parseAmount(cell(row, amount))
      if (!isDateKey(expenseDate) || value <= 0) {
        skipped++
        continue
      }
      const target =
        findOrCreateCategory(draft, cell(row, category)) ??
        findOrCreateCategory(draft, 'Importado')!
      const expenseConcept = cell(row, concept) || 'Gasto'
      const duplicated = draft.expenses.some(
        (e) =>
          e.date === expenseDate &&
          e.categoryId === target.id &&
          e.concept === expenseConcept &&
          Math.abs(e.amount - value) < 0.005,
      )
      if (duplicated) {
        skipped++
        continue
      }
      draft.expenses.push({
        id: createId(),
        categoryId: target.id,
        amount: value,
        concept: expenseConcept,
        date: expenseDate,
        createdAt: Date.now(),
      })
      added++
    }
    return { state: draft, result: { kind: 'expenses', added, skipped } }
  }

  if (column('mes') >= 0) {
    const [month, available, kind, name, budget] = BUDGET_HEADERS.map(column)
    // Files exported before goals existed have `categoria` instead of
    // `tipo` + `nombre`.
    const legacyCategory = column('categoria')
    let imported = 0
    for (const row of rows.slice(1)) {
      const monthKey = cell(row, month)
      if (!isMonthKey(monthKey)) continue
      const target = ensureMonth(draft, monthKey)
      const availableText = cell(row, available)
      if (availableText !== '') target.available = parseAmount(availableText)
      const value = parseAmount(cell(row, budget))
      const itemName = cell(row, name >= 0 ? name : legacyCategory)
      if (normalizeHeader(cell(row, kind)) === BUDGET_KIND.goal) {
        if (itemName && value > 0) {
          target.goals[findOrCreateGoal(draft, itemName).goal.id] = value
        }
      } else {
        const budgetCategory = findOrCreateCategory(draft, itemName)
        if (budgetCategory && value > 0) {
          target.budgets[budgetCategory.id] = value
        }
      }
      imported++
    }
    return { state: draft, result: { kind: 'budgets', rows: imported } }
  }

  return { state, result: { kind: 'unknown' } }
}
