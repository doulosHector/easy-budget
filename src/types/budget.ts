import type { CategoryIconName } from '../constants/icons'

/** Month key in `YYYY-MM` format. */
export type MonthKey = string

/** Calendar date in `YYYY-MM-DD` format. */
export type DateKey = string

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Category {
  id: string
  name: string
  icon: CategoryIconName
  color: string
}

export interface Expense {
  id: string
  categoryId: string
  amount: number
  concept: string
  date: DateKey
  /** Epoch milliseconds, used to order expenses registered on the same day. */
  createdAt: number
}

/** Money set aside over time for a purpose (a trip, an emergency fund…). */
export interface Goal {
  id: string
  name: string
  /** Amount to reach, or `null` for an open-ended goal. */
  target: number | null
  /** Day the target should be reached by, if any. */
  deadline: DateKey | null
  /**
   * Money the goal already had outside its recorded contributions, e.g.
   * savings from before the goal was created. Part of the balance, but not
   * of any month's savings. Negative after lowering the current saving
   * below what the contributions add up to.
   */
  startingBalance: number
  icon: CategoryIconName
  color: string
  createdAt: number
}

/**
 * Money moved into a goal (positive amount) or withdrawn from it (negative).
 * A goal's balance is the sum of its contributions.
 */
export interface Contribution {
  id: string
  goalId: string
  amount: number
  date: DateKey
  createdAt: number
}

export interface MonthBudget {
  /** Money available for the month, or `null` when it was never configured. */
  available: number | null
  /** Budget per category id. Categories without budget are omitted. */
  budgets: Record<string, number>
  /** Planned contribution per goal id. Goals without a plan are omitted. */
  goals: Record<string, number>
}

export interface Settings {
  theme: ThemePreference
}

export interface BudgetState {
  categories: Category[]
  months: Record<MonthKey, MonthBudget>
  expenses: Expense[]
  goals: Goal[]
  contributions: Contribution[]
  settings: Settings
}
