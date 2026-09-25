import type { BudgetState, Category, Expense } from '../types'

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

export const budgetState = (
  overrides: Partial<BudgetState> = {},
): BudgetState => ({
  categories: [category()],
  months: {},
  expenses: [],
  settings: { theme: 'system' },
  ...overrides,
})
