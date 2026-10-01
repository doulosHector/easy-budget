import { createContext, type Dispatch } from 'react'
import { createDefaultState } from '../../services/defaults'
import type {
  BudgetState,
  Category,
  Contribution,
  Expense,
  Goal,
  MonthKey,
  ThemePreference,
} from '../../types'
import { createId } from '../../utils/id'
import type {
  BudgetAction,
  CategoryChanges,
  ExpenseChanges,
  GoalChanges,
} from './budgetReducer'

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>
export type NewCategory = Omit<Category, 'id'>
export type NewGoal = Omit<Goal, 'id' | 'createdAt'>
export type NewContribution = Omit<Contribution, 'id' | 'createdAt'>

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
  addGoal: (
    goal: NewGoal,
    initialPlan?: { month: MonthKey; amount: number },
  ): void =>
    dispatch({
      type: 'goalAdded',
      goal: { ...goal, id: createId(), createdAt: Date.now() },
      month: initialPlan?.month ?? '',
      plan: initialPlan?.amount ?? 0,
    }),
  updateGoal: (id: string, changes: GoalChanges): void =>
    dispatch({ type: 'goalUpdated', id, changes }),
  deleteGoal: (id: string): void => dispatch({ type: 'goalDeleted', id }),
  setGoalPlan: (month: MonthKey, goalId: string, amount: number): void =>
    dispatch({ type: 'goalPlanSet', month, goalId, amount }),

  /** Positive `amount` adds money to the goal, negative withdraws it. */
  addContribution: (contribution: NewContribution): void =>
    dispatch({
      type: 'contributionAdded',
      contribution: { ...contribution, id: createId(), createdAt: Date.now() },
    }),
  deleteContribution: (id: string): void =>
    dispatch({ type: 'contributionDeleted', id }),

  saveMonth: (
    month: MonthKey,
    available: number | null,
    budgets: Record<string, number>,
    goals: Record<string, number> = {},
  ): void => dispatch({ type: 'monthSaved', month, available, budgets, goals }),

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
