import type {
  BudgetState,
  Category,
  DateKey,
  Expense,
  MonthKey,
} from '../types'
import { dayOfMonth, daysInMonth, monthOf, shiftMonth } from '../utils/date'
import { sum } from '../utils/number'
import { getMonthBalance } from './balance'
import { getSpending, type Spending } from './budget'
import { getGoalsPlanned, getSavings } from './goals'

export interface MonthSummary {
  spent: number
  previousSpent: number
  /** Difference with the previous month (positive means spending more). */
  diff: number
  /** Rounded percentage change, or `null` without previous spending. */
  diffPercent: number | null
  dailyAverage: number
  expenseCount: number
}

/** Days of `month` already elapsed at `now` (all for past, 0 for future). */
export const elapsedDays = (month: MonthKey, now: DateKey): number => {
  const current = monthOf(now)
  if (current === month) return dayOfMonth(now)
  return month < current ? daysInMonth(month) : 0
}

export const getMonthSummary = (
  expenses: readonly Expense[],
  month: MonthKey,
  now: DateKey,
): MonthSummary => {
  const spent = getSpending(expenses, month).total
  const previousSpent = getSpending(expenses, shiftMonth(month, -1)).total
  const diff = spent - previousSpent
  const elapsed = elapsedDays(month, now)
  return {
    spent,
    previousSpent,
    diff,
    diffPercent:
      previousSpent > 0 ? Math.round((diff / previousSpent) * 100) : null,
    dailyAverage: elapsed > 0 ? spent / elapsed : 0,
    expenseCount: expenses.filter((e) => monthOf(e.date) === month).length,
  }
}

export interface CategoryShare {
  category: Category
  spent: number
  /** Share of the month total, 0–100. */
  percent: number
}

/** Categories with spending in the month, highest first. */
export const getCategoryBreakdown = (
  categories: readonly Category[],
  spending: Spending,
): CategoryShare[] =>
  categories
    .map((category) => {
      const spent = spending.byCategory[category.id] ?? 0
      return {
        category,
        spent,
        percent: spending.total ? (spent / spending.total) * 100 : 0,
      }
    })
    .filter((row) => row.spent > 0)
    .sort((a, b) => b.spent - a.spent)

/** Total spent per day of the month (index 0 is day 1). */
export const getDailySpending = (
  expenses: readonly Expense[],
  month: MonthKey,
): number[] => {
  const perDay = Array<number>(daysInMonth(month)).fill(0)
  for (const expense of expenses) {
    if (monthOf(expense.date) === month) {
      perDay[dayOfMonth(expense.date) - 1] += expense.amount
    }
  }
  return perDay
}

export interface ConceptTotal {
  name: string
  count: number
  total: number
}

/** Concepts (case-insensitive) with the highest spending in the month. */
export const getTopConcepts = (
  expenses: readonly Expense[],
  month: MonthKey,
  limit = 5,
): ConceptTotal[] => {
  const byConcept = new Map<string, ConceptTotal>()
  for (const expense of expenses) {
    if (monthOf(expense.date) !== month) continue
    const name = expense.concept.trim()
    const key = name.toLowerCase()
    const entry = byConcept.get(key) ?? { name, count: 0, total: 0 }
    entry.count++
    entry.total += expense.amount
    byConcept.set(key, entry)
  }
  return [...byConcept.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export interface CategoryAverage {
  category: Category
  total: number
  /** Number of months (within the window) with at least one expense. */
  activeMonths: number
}

export interface MonthlyAverages {
  /** Months in the window, oldest first, ending with the reference month. */
  months: MonthKey[]
  total: number
  rows: CategoryAverage[]
}

/** Spending per category over the `span` months ending at `month`. */
export const getMonthlyAverages = (
  categories: readonly Category[],
  expenses: readonly Expense[],
  month: MonthKey,
  span = 12,
): MonthlyAverages => {
  const months = Array.from({ length: span }, (_, i) =>
    shiftMonth(month, i - span + 1),
  )
  const window = new Set(months)
  const byCategory = new Map<string, { total: number; months: Set<string> }>()
  let total = 0
  for (const expense of expenses) {
    const expenseMonth = monthOf(expense.date)
    if (!window.has(expenseMonth)) continue
    const entry = byCategory.get(expense.categoryId) ?? {
      total: 0,
      months: new Set<string>(),
    }
    entry.total += expense.amount
    entry.months.add(expenseMonth)
    byCategory.set(expense.categoryId, entry)
    total += expense.amount
  }
  const rows = categories
    .flatMap((category) => {
      const entry = byCategory.get(category.id)
      return entry
        ? [{ category, total: entry.total, activeMonths: entry.months.size }]
        : []
    })
    .sort((a, b) => b.total - a.total)
  return { months, total, rows }
}

export interface SavingsSummary {
  saved: number
  withdrawn: number
  planned: number
  /** Balance of all goals together. */
  total: number
  /**
   * Rounded share of the month's available money that went into goals, or
   * `null` when the month has no available money configured.
   */
  savedPercent: number | null
}

export const getSavingsSummary = (
  state: BudgetState,
  month: MonthKey,
): SavingsSummary => {
  const { saved, withdrawn } = getSavings(state.contributions, month)
  const { configured, available } = getMonthBalance(state, month)
  return {
    saved,
    withdrawn,
    planned: getGoalsPlanned(state, month),
    total: sum(state.contributions.map((c) => c.amount)),
    savedPercent:
      configured != null && available > 0
        ? Math.round((saved / available) * 100)
        : null,
  }
}
