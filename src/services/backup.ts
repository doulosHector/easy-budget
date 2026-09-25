import { DEFAULT_CATEGORY_ICON } from '../constants/icons'
import { paletteColor } from '../constants/palette'
import type { BudgetState, Category, MonthBudget } from '../types'
import { normalizeHeader, parseCsv, toCsv } from '../utils/csv'
import { isDateKey, isMonthKey } from '../utils/date'
import { createId } from '../utils/id'
import { parseAmount } from '../utils/number'
import { compareExpensesDesc, findCategory } from './budget'

export const EXPENSES_FILENAME = 'easy-budget-gastos.csv'
export const BUDGETS_FILENAME = 'easy-budget-presupuestos.csv'

const EXPENSE_HEADERS = ['fecha', 'categoria', 'concepto', 'monto']
const BUDGET_HEADERS = ['mes', 'disponible', 'categoria', 'presupuesto']

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

/** One row per month and category budget (or one row for months without). */
export const exportBudgetsCsv = (state: BudgetState): string => {
  const rows: string[][] = [BUDGET_HEADERS]
  for (const month of Object.keys(state.months).sort()) {
    const { available, budgets } = state.months[month]
    const availableText = available == null ? '' : available.toFixed(2)
    const ids = Object.keys(budgets)
    if (!ids.length) rows.push([month, availableText, '', ''])
    for (const id of ids) {
      const category = findCategory(state.categories, id)
      if (category) {
        rows.push([month, availableText, category.name, budgets[id].toFixed(2)])
      }
    }
  }
  return toCsv(rows)
}

export type ImportResult =
  | { kind: 'expenses'; added: number; skipped: number }
  | { kind: 'budgets'; rows: number }
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

const ensureMonth = (draft: BudgetState, month: string): MonthBudget =>
  (draft.months[month] ??= { available: null, budgets: {} })

/**
 * Imports a CSV previously exported by the app (expenses or budgets).
 * Unknown categories are created; duplicated expenses are skipped.
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
    const [month, available, category, budget] = BUDGET_HEADERS.map(column)
    let imported = 0
    for (const row of rows.slice(1)) {
      const monthKey = cell(row, month)
      if (!isMonthKey(monthKey)) continue
      const target = ensureMonth(draft, monthKey)
      const availableText = cell(row, available)
      if (availableText !== '') target.available = parseAmount(availableText)
      const budgetCategory = findOrCreateCategory(draft, cell(row, category))
      const value = parseAmount(cell(row, budget))
      if (budgetCategory && value > 0) target.budgets[budgetCategory.id] = value
      imported++
    }
    return { state: draft, result: { kind: 'budgets', rows: imported } }
  }

  return { state, result: { kind: 'unknown' } }
}
