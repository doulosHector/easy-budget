import type { BudgetState, Category } from '../types'
import { createId } from '../utils/id'

export const createDefaultCategories = (): Category[] => [
  { id: createId(), name: 'Casa', icon: 'home', color: '#3B82A0' },
  { id: createId(), name: 'Comida', icon: 'food', color: '#2F8F6F' },
  { id: createId(), name: 'Transporte', icon: 'car', color: '#C4763B' },
  { id: createId(), name: 'Salud', icon: 'heart', color: '#C94F4F' },
  { id: createId(), name: 'Ocio', icon: 'music', color: '#6D5BD0' },
]

export const createDefaultState = (): BudgetState => ({
  categories: createDefaultCategories(),
  months: {},
  expenses: [],
  settings: { theme: 'system' },
})
