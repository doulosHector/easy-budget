import type { DateKey } from './budget'

export type View = 'budget' | 'expenses' | 'stats' | 'settings'

export interface ExpenseFilters {
  /** Category id, or an empty string for all categories. */
  categoryId: string
  from: DateKey | ''
  to: DateKey | ''
  query: string
}

/** Every bottom sheet the app can show, with the data it needs. */
export type SheetState =
  | { type: 'category'; categoryId: string }
  | { type: 'categoryBudget'; categoryId: string }
  | { type: 'categoryForm'; categoryId: string | null }
  | { type: 'monthSetup' }
  | { type: 'expense'; expenseId: string }
  | { type: 'goal'; goalId: string }
  | { type: 'goalPlan'; goalId: string }
  | { type: 'goalForm'; goalId: string | null }
  | { type: 'csvFallback'; filename: string; data: string }
