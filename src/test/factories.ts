import type {
  BudgetState,
  Category,
  Contribution,
  Expense,
  Goal,
  MonthBudget,
} from '../types'

export const category = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-food',
  name: 'Comida',
  icon: 'food',
  color: '#2F8F6F',
  ...overrides,
})

export const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: `exp-${Math.random().toString(36).slice(2)}`,
  categoryId: 'cat-food',
  amount: 100,
  concept: 'Super',
  date: '2026-09-10',
  createdAt: 1,
  ...overrides,
})

export const month = (overrides: Partial<MonthBudget> = {}): MonthBudget => ({
  available: null,
  budgets: {},
  goals: {},
  ...overrides,
})

export const goal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-trip',
  name: 'Viaje',
  target: 12000,
  deadline: '2026-12',
  icon: 'plane',
  color: '#3B82A0',
  createdAt: 1,
  ...overrides,
})

export const contribution = (
  overrides: Partial<Contribution> = {},
): Contribution => ({
  id: `con-${Math.random().toString(36).slice(2)}`,
  goalId: 'goal-trip',
  amount: 1000,
  date: '2026-09-10',
  createdAt: 1,
  ...overrides,
})

export const budgetState = (
  overrides: Partial<BudgetState> = {},
): BudgetState => ({
  categories: [category()],
  months: {},
  expenses: [],
  goals: [],
  contributions: [],
  settings: { theme: 'system' },
  ...overrides,
})
