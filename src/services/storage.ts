import { DEFAULT_CATEGORY_ICON, isCategoryIconName } from '../constants/icons'
import { paletteColor } from '../constants/palette'
import type {
  BudgetState,
  Category,
  Expense,
  MonthBudget,
  ThemePreference,
} from '../types'
import { isDateKey } from '../utils/date'
import { createDefaultState } from './defaults'

/** Same key as the original single-file app, so existing data keeps working. */
export const STORAGE_KEY = 'easybudget:v1'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark']

const toCategory = (raw: unknown, index: number): Category | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null
  return {
    id: raw.id,
    name: raw.name,
    icon: isCategoryIconName(raw.icon) ? raw.icon : DEFAULT_CATEGORY_ICON,
    color: typeof raw.color === 'string' ? raw.color : paletteColor(index),
  }
}

const toExpense = (raw: unknown): Expense | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  // `catId` is the field name used by the original single-file app.
  const categoryId = raw.categoryId ?? raw.catId
  if (typeof categoryId !== 'string') return null
  if (!isFiniteNumber(raw.amount) || raw.amount <= 0) return null
  if (typeof raw.date !== 'string' || !isDateKey(raw.date)) return null
  return {
    id: raw.id,
    categoryId,
    amount: raw.amount,
    concept: typeof raw.concept === 'string' ? raw.concept : 'Gasto',
    date: raw.date,
    createdAt: isFiniteNumber(raw.createdAt) ? raw.createdAt : 0,
  }
}

const toMonth = (raw: unknown): MonthBudget => {
  const month: MonthBudget = { available: null, budgets: {} }
  if (!isRecord(raw)) return month
  if (isFiniteNumber(raw.available)) month.available = raw.available
  if (isRecord(raw.budgets)) {
    for (const [id, value] of Object.entries(raw.budgets)) {
      if (isFiniteNumber(value) && value > 0) month.budgets[id] = value
    }
  }
  return month
}

const notNull = <T>(value: T | null): value is T => value !== null

/**
 * Validates untrusted data (localStorage or a backup) into a `BudgetState`.
 * Returns `null` when the shape is not recognizable at all.
 */
export const normalizeState = (raw: unknown): BudgetState | null => {
  if (!isRecord(raw) || !Array.isArray(raw.categories)) return null
  const months: BudgetState['months'] = {}
  if (isRecord(raw.months)) {
    for (const [key, value] of Object.entries(raw.months)) {
      months[key] = toMonth(value)
    }
  }
  const settings = isRecord(raw.settings) ? raw.settings : {}
  return {
    categories: raw.categories.map(toCategory).filter(notNull),
    months,
    expenses: Array.isArray(raw.expenses)
      ? raw.expenses.map(toExpense).filter(notNull)
      : [],
    settings: {
      theme: THEMES.includes(settings.theme as ThemePreference)
        ? (settings.theme as ThemePreference)
        : 'system',
    },
  }
}

export const loadState = (): BudgetState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const state = normalizeState(JSON.parse(raw))
      if (state) return state
    }
  } catch {
    // Corrupted data or storage not available: start fresh.
  }
  return createDefaultState()
}

/** Persists the state. Returns `false` if storage is full or unavailable. */
export const saveState = (state: BudgetState): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
