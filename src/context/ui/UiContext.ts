import { createContext } from 'react'
import type { ExpenseFilters, MonthKey, SheetState, View } from '../../types'

export interface ActiveSheet {
  state: SheetState
  /** Changes on every open so sheet forms start from a clean state. */
  key: number
}

export interface UiContextValue {
  view: View
  setView: (view: View) => void

  /** Month currently being browsed. */
  month: MonthKey
  /** Changes the month and resets the expense date filters to it. */
  setMonth: (month: MonthKey) => void

  filters: ExpenseFilters
  updateFilters: (changes: Partial<ExpenseFilters>) => void

  sheet: ActiveSheet | null
  isSheetOpen: boolean
  openSheet: (sheet: SheetState) => void
  closeSheet: () => void
}

export const UiContext = createContext<UiContextValue | null>(null)
