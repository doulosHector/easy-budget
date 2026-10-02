import {
  DEFAULT_CATEGORY_ICON,
  DEFAULT_GOAL_ICON,
  isCategoryIconName,
} from '../constants/icons'
import { paletteColor } from '../constants/palette'
import type {
  BudgetState,
  Category,
  Contribution,
  Expense,
  Goal,
  MonthBudget,
  ThemePreference,
} from '../types'
import { isDateKey, parseDeadline } from '../utils/date'
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

const toGoal = (raw: unknown, index: number): Goal | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  if (typeof raw.name !== 'string' || !raw.name.trim()) return null
  return {
    id: raw.id,
    name: raw.name,
    target: isFiniteNumber(raw.target) && raw.target > 0 ? raw.target : null,
    deadline:
      typeof raw.deadline === 'string' ? parseDeadline(raw.deadline) : null,
    icon: isCategoryIconName(raw.icon) ? raw.icon : DEFAULT_GOAL_ICON,
    color: typeof raw.color === 'string' ? raw.color : paletteColor(index),
    createdAt: isFiniteNumber(raw.createdAt) ? raw.createdAt : 0,
  }
}

const toContribution = (raw: unknown): Contribution | null => {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null
  if (typeof raw.goalId !== 'string') return null
  if (!isFiniteNumber(raw.amount) || raw.amount === 0) return null
  if (typeof raw.date !== 'string' || !isDateKey(raw.date)) return null
  return {
    id: raw.id,
    goalId: raw.goalId,
    amount: raw.amount,
    date: raw.date,
    createdAt: isFiniteNumber(raw.createdAt) ? raw.createdAt : 0,
  }
}

/** Keeps only the positive amounts of an `{ id: amount }` record. */
const toAmounts = (raw: unknown): Record<string, number> => {
  const amounts: Record<string, number> = {}
  if (!isRecord(raw)) return amounts
  for (const [id, value] of Object.entries(raw)) {
    if (isFiniteNumber(value) && value > 0) amounts[id] = value
  }
  return amounts
}

const toMonth = (raw: unknown): MonthBudget => {
  if (!isRecord(raw)) return { available: null, budgets: {}, goals: {} }
  return {
    available: isFiniteNumber(raw.available) ? raw.available : null,
    budgets: toAmounts(raw.budgets),
    // Months saved before savings goals existed have no `goals`.
    goals: toAmounts(raw.goals),
  }
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
  // Data saved before savings goals existed has no `goals`/`contributions`.
  const goals = Array.isArray(raw.goals)
    ? raw.goals.map(toGoal).filter(notNull)
    : []
  const goalIds = new Set(goals.map((g) => g.id))
  return {
    categories: raw.categories.map(toCategory).filter(notNull),
    months,
    expenses: Array.isArray(raw.expenses)
      ? raw.expenses.map(toExpense).filter(notNull)
      : [],
    goals,
    contributions: Array.isArray(raw.contributions)
      ? raw.contributions
          .map(toContribution)
          .filter(notNull)
          .filter((c) => goalIds.has(c.goalId))
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
