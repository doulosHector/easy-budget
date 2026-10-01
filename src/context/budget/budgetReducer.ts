import type {
  BudgetState,
  Category,
  Contribution,
  Expense,
  Goal,
  MonthBudget,
  MonthKey,
  ThemePreference,
} from '../../types'

export type ExpenseChanges = Partial<Omit<Expense, 'id' | 'createdAt'>>
export type CategoryChanges = Partial<Omit<Category, 'id'>>
export type GoalChanges = Partial<Omit<Goal, 'id' | 'createdAt'>>

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
  | { type: 'goalAdded'; goal: Goal; month: MonthKey; plan: number }
  | { type: 'goalUpdated'; id: string; changes: GoalChanges }
  | { type: 'goalDeleted'; id: string }
  | { type: 'goalPlanSet'; month: MonthKey; goalId: string; amount: number }
  | { type: 'contributionAdded'; contribution: Contribution }
  | { type: 'contributionDeleted'; id: string }
  | {
      type: 'monthSaved'
      month: MonthKey
      available: number | null
      budgets: Record<string, number>
      goals: Record<string, number>
    }
  | { type: 'themeChanged'; theme: ThemePreference }
  | { type: 'stateReplaced'; state: BudgetState }

const emptyMonth = (): MonthBudget => ({
  available: null,
  budgets: {},
  goals: {},
})

/** Sets an amount, removing the entry when the amount is not positive. */
const withAmount = (
  amounts: Record<string, number>,
  id: string,
  amount: number,
): Record<string, number> => {
  const next = { ...amounts }
  if (amount > 0) next[id] = amount
  else delete next[id]
  return next
}

const mergeAmounts = (
  current: Record<string, number>,
  changes: Record<string, number>,
): Record<string, number> =>
  Object.entries(changes).reduce(
    (amounts, [id, amount]) => withAmount(amounts, id, amount),
    current,
  )

/** Applies `update` to every month (used to clean up deleted ids). */
const mapMonths = (
  months: BudgetState['months'],
  update: (month: MonthBudget) => MonthBudget,
): BudgetState['months'] =>
  Object.fromEntries(
    Object.entries(months).map(([key, month]) => [key, update(month)]),
  )

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
        budgets: withAmount(m.budgets, action.category.id, action.budget),
      }))
    }

    case 'categoryUpdated':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c,
        ),
      }

    case 'categoryDeleted':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        expenses: state.expenses.filter((e) => e.categoryId !== action.id),
        months: mapMonths(state.months, (m) => ({
          ...m,
          budgets: withAmount(m.budgets, action.id, 0),
        })),
      }

    case 'categoryBudgetSet':
      return updateMonth(state, action.month, (m) => ({
        ...m,
        budgets: withAmount(m.budgets, action.categoryId, action.amount),
      }))

    case 'goalAdded': {
      const next = { ...state, goals: [...state.goals, action.goal] }
      if (action.plan <= 0) return next
      return updateMonth(next, action.month, (m) => ({
        ...m,
        goals: withAmount(m.goals, action.goal.id, action.plan),
      }))
    }

    case 'goalUpdated':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.id ? { ...g, ...action.changes } : g,
        ),
      }

    case 'goalDeleted':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.id),
        contributions: state.contributions.filter(
          (c) => c.goalId !== action.id,
        ),
        months: mapMonths(state.months, (m) => ({
          ...m,
          goals: withAmount(m.goals, action.id, 0),
        })),
      }

    case 'goalPlanSet':
      return updateMonth(state, action.month, (m) => ({
        ...m,
        goals: withAmount(m.goals, action.goalId, action.amount),
      }))

    case 'contributionAdded':
      return {
        ...state,
        contributions: [...state.contributions, action.contribution],
      }

    case 'contributionDeleted':
      return {
        ...state,
        contributions: state.contributions.filter((c) => c.id !== action.id),
      }

    case 'monthSaved':
      return updateMonth(state, action.month, (m) => ({
        available: action.available,
        budgets: mergeAmounts(m.budgets, action.budgets),
        goals: mergeAmounts(m.goals, action.goals),
      }))

    case 'themeChanged':
      return { ...state, settings: { ...state.settings, theme: action.theme } }

    case 'stateReplaced':
      return action.state
  }
}
