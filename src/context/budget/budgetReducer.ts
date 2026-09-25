import type {
  BudgetState,
  Category,
  Expense,
  MonthBudget,
  MonthKey,
  ThemePreference,
} from '../../types'

export type ExpenseChanges = Partial<Omit<Expense, 'id' | 'createdAt'>>
export type CategoryChanges = Partial<Omit<Category, 'id'>>

export type BudgetAction =
  | { type: 'expenseAdded'; expense: Expense }
  | { type: 'expenseUpdated'; id: string; changes: ExpenseChanges }
  | { type: 'expenseDeleted'; id: string }
  | {
      type: 'categoryAdded'
      category: Category
      month: MonthKey
      budget: number
    }
  | { type: 'categoryUpdated'; id: string; changes: CategoryChanges }
  | { type: 'categoryDeleted'; id: string }
  | {
      type: 'categoryBudgetSet'
      month: MonthKey
      categoryId: string
      amount: number
    }
  | {
      type: 'monthSaved'
      month: MonthKey
      available: number | null
      budgets: Record<string, number>
    }
  | { type: 'themeChanged'; theme: ThemePreference }
  | { type: 'stateReplaced'; state: BudgetState }

const emptyMonth = (): MonthBudget => ({ available: null, budgets: {} })

/** Sets a budget, removing the entry when the amount is not positive. */
const withBudget = (
  budgets: Record<string, number>,
  categoryId: string,
  amount: number,
): Record<string, number> => {
  const next = { ...budgets }
  if (amount > 0) next[categoryId] = amount
  else delete next[categoryId]
  return next
}

const updateMonth = (
  state: BudgetState,
  month: MonthKey,
  update: (current: MonthBudget) => MonthBudget,
): BudgetState => ({
  ...state,
  months: {
    ...state.months,
    [month]: update(state.months[month] ?? emptyMonth()),
  },
})

export const budgetReducer = (
  state: BudgetState,
  action: BudgetAction,
): BudgetState => {
  switch (action.type) {
    case 'expenseAdded':
      return { ...state, expenses: [...state.expenses, action.expense] }

    case 'expenseUpdated':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.id ? { ...e, ...action.changes } : e,
        ),
      }

    case 'expenseDeleted':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.id),
      }

    case 'categoryAdded': {
      const next = {
        ...state,
        categories: [...state.categories, action.category],
      }
      if (action.budget <= 0) return next
      return updateMonth(next, action.month, (m) => ({
        ...m,
        budgets: withBudget(m.budgets, action.category.id, action.budget),
      }))
    }

    case 'categoryUpdated':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c,
        ),
      }

    case 'categoryDeleted': {
      const months: BudgetState['months'] = {}
      for (const [key, month] of Object.entries(state.months)) {
        months[key] = {
          ...month,
          budgets: withBudget(month.budgets, action.id, 0),
        }
      }
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        expenses: state.expenses.filter((e) => e.categoryId !== action.id),
        months,
      }
    }

    case 'categoryBudgetSet':
      return updateMonth(state, action.month, (m) => ({
        ...m,
        budgets: withBudget(m.budgets, action.categoryId, action.amount),
      }))

    case 'monthSaved':
      return updateMonth(state, action.month, (m) => ({
        available: action.available,
        budgets: Object.entries(action.budgets).reduce(
          (budgets, [id, amount]) => withBudget(budgets, id, amount),
          m.budgets,
        ),
      }))

    case 'themeChanged':
      return { ...state, settings: { ...state.settings, theme: action.theme } }

    case 'stateReplaced':
      return action.state
  }
}
