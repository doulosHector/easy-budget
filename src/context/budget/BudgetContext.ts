import { createContext, type Dispatch } from 'react'
import { createDefaultState } from '../../services/defaults'
import type {
  BudgetState,
  Category,
  Expense,
  MonthKey,
  ThemePreference,
} from '../../types'
import { createId } from '../../utils/id'
import type {
  BudgetAction,
  CategoryChanges,
  ExpenseChanges,
} from './budgetReducer'

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>
export type NewCategory = Omit<Category, 'id'>

export const createBudgetActions = (dispatch: Dispatch<BudgetAction>) => ({
  addExpense: (expense: NewExpense): void =>
    dispatch({
      type: 'expenseAdded',
      expense: { ...expense, id: createId(), createdAt: Date.now() },
    }),
  updateExpense: (id: string, changes: ExpenseChanges): void =>
    dispatch({ type: 'expenseUpdated', id, changes }),
  deleteExpense: (id: string): void => dispatch({ type: 'expenseDeleted', id }),

  addCategory: (
    category: NewCategory,
    initialBudget?: { month: MonthKey; amount: number },
  ): void =>
    dispatch({
      type: 'categoryAdded',
      category: { ...category, id: createId() },
      month: initialBudget?.month ?? '',
      budget: initialBudget?.amount ?? 0,
    }),
  updateCategory: (id: string, changes: CategoryChanges): void =>
    dispatch({ type: 'categoryUpdated', id, changes }),
  deleteCategory: (id: string): void =>
    dispatch({ type: 'categoryDeleted', id }),

  setCategoryBudget: (
    month: MonthKey,
    categoryId: string,
    amount: number,
  ): void => dispatch({ type: 'categoryBudgetSet', month, categoryId, amount }),
  saveMonth: (
    month: MonthKey,
    available: number | null,
    budgets: Record<string, number>,
  ): void => dispatch({ type: 'monthSaved', month, available, budgets }),

  setTheme: (theme: ThemePreference): void =>
    dispatch({ type: 'themeChanged', theme }),
  replaceState: (state: BudgetState): void =>
    dispatch({ type: 'stateReplaced', state }),
  resetState: (): void =>
    dispatch({ type: 'stateReplaced', state: createDefaultState() }),
})

export type BudgetActions = ReturnType<typeof createBudgetActions>

export interface BudgetContextValue {
  state: BudgetState
  actions: BudgetActions
}

export const BudgetContext = createContext<BudgetContextValue | null>(null)
