import type {
  BudgetState,
  Category,
  Expense,
  ExpenseFilters,
  MonthBudget,
  MonthKey,
} from '../types'
import { monthOf, shiftMonth } from '../utils/date'
import { sum } from '../utils/number'

const EMPTY_MONTH: MonthBudget = Object.freeze({
  available: null,
  budgets: Object.freeze({}),
  goals: Object.freeze({}),
}) as MonthBudget

export interface Spending {
  byCategory: Record<string, number>
  total: number
}

export interface BudgetSuggestions {
  /** Budget assigned last month. */
  last: number
  /** Average of the non-zero budgets of the last three months. */
  avg: number
  /** What was left unspent last month. */
  remaining: number
}

export type SuggestionKind = keyof BudgetSuggestions

export const findCategory = (
  categories: readonly Category[],
  id: string,
): Category | undefined => categories.find((c) => c.id === id)

export const getMonth = (state: BudgetState, month: MonthKey): MonthBudget =>
  state.months[month] ?? EMPTY_MONTH

export const getCategoryBudget = (
  state: BudgetState,
  month: MonthKey,
  categoryId: string,
): number => getMonth(state, month).budgets[categoryId] ?? 0

export const getSpending = (
  expenses: readonly Expense[],
  month: MonthKey,
): Spending => {
  const byCategory: Record<string, number> = {}
  let total = 0
  for (const expense of expenses) {
    if (monthOf(expense.date) !== month) continue
    byCategory[expense.categoryId] =
      (byCategory[expense.categoryId] ?? 0) + expense.amount
    total += expense.amount
  }
  return { byCategory, total }
}

/** Sum of the budgets assigned to existing categories in a month. */
export const getAssignedTotal = (state: BudgetState, month: MonthKey): number =>
  sum(state.categories.map((c) => getCategoryBudget(state, month, c.id)))

/** Budget suggestions for a category, based on previous months. */
export const getSuggestions = (
  state: BudgetState,
  month: MonthKey,
  categoryId: string,
): BudgetSuggestions => {
  const previous = shiftMonth(month, -1)
  const last = getCategoryBudget(state, previous, categoryId)
  const lastSpent =
    getSpending(state.expenses, previous).byCategory[categoryId] ?? 0
  const recent = [1, 2, 3]
    .map((i) => getCategoryBudget(state, shiftMonth(month, -i), categoryId))
    .filter((budget) => budget > 0)
  return {
    last,
    avg: recent.length ? sum(recent) / recent.length : 0,
    remaining: Math.max(0, last - lastSpent),
  }
}

/** Most recently used unique concepts, optionally within a category. */
export const getRecentConcepts = (
  expenses: readonly Expense[],
  categoryId?: string,
  limit = 8,
): string[] => {
  const seen = new Set<string>()
  const concepts: string[] = []
  const sorted = expenses
    .filter((e) => !categoryId || e.categoryId === categoryId)
    .sort((a, b) => b.createdAt - a.createdAt)
  for (const expense of sorted) {
    const concept = expense.concept.trim()
    const key = concept.toLowerCase()
    if (concept && !seen.has(key)) {
      seen.add(key)
      concepts.push(concept)
    }
    if (concepts.length >= limit) break
  }
  return concepts
}

/** Newest first: by date, then by creation time. */
export const compareExpensesDesc = (a: Expense, b: Expense): number =>
  b.date.localeCompare(a.date) || b.createdAt - a.createdAt

export const filterExpenses = (
  expenses: readonly Expense[],
  filters: ExpenseFilters,
): Expense[] => {
  const query = filters.query.trim().toLowerCase()
  return expenses
    .filter(
      (e) =>
        (!filters.categoryId || e.categoryId === filters.categoryId) &&
        (!filters.from || e.date >= filters.from) &&
        (!filters.to || e.date <= filters.to) &&
        (!query || e.concept.toLowerCase().includes(query)),
    )
    .sort(compareExpensesDesc)
}
