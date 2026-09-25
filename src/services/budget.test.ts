import { describe, expect, it } from 'vitest'
import { budgetState, expense } from '../test/factories'
import {
  filterExpenses,
  getAssignedTotal,
  getRecentConcepts,
  getSpending,
  getSuggestions,
} from './budget'

describe('getSpending', () => {
  it('totals only the expenses of the month, per category', () => {
    const expenses = [
      expense({ amount: 100, date: '2026-09-01' }),
      expense({ amount: 50, date: '2026-09-30', categoryId: 'other' }),
      expense({ amount: 999, date: '2026-10-01' }),
    ]
    expect(getSpending(expenses, '2026-09')).toEqual({
      total: 150,
      byCategory: { 'cat-food': 100, other: 50 },
    })
  })
})

describe('getSuggestions', () => {
  it('suggests last budget, 3-month average and last remainder', () => {
    const state = budgetState({
      months: {
        '2026-06': { available: null, budgets: { 'cat-food': 300 } },
        '2026-07': { available: null, budgets: {} },
        '2026-08': { available: null, budgets: { 'cat-food': 500 } },
      },
      expenses: [expense({ amount: 120, date: '2026-08-15' })],
    })
    expect(getSuggestions(state, '2026-09', 'cat-food')).toEqual({
      last: 500,
      avg: 400,
      remaining: 380,
    })
  })
})

describe('getAssignedTotal', () => {
  it('ignores budgets of categories that no longer exist', () => {
    const state = budgetState({
      months: {
        '2026-09': { available: 1000, budgets: { 'cat-food': 300, gone: 50 } },
      },
    })
    expect(getAssignedTotal(state, '2026-09')).toBe(300)
  })
})

describe('getRecentConcepts', () => {
  it('returns unique concepts, newest first, case-insensitively', () => {
    const expenses = [
      expense({ concept: 'Super', createdAt: 1 }),
      expense({ concept: 'Tacos', createdAt: 2 }),
      expense({ concept: 'super ', createdAt: 3 }),
    ]
    expect(getRecentConcepts(expenses)).toEqual(['super', 'Tacos'])
  })
})

describe('filterExpenses', () => {
  const expenses = [
    expense({ id: 'a', concept: 'Tacos', date: '2026-09-02' }),
    expense({
      id: 'b',
      concept: 'Gasolina',
      date: '2026-09-05',
      categoryId: 'car',
    }),
    expense({ id: 'c', concept: 'Tacos', date: '2026-10-01' }),
  ]
  const all = { categoryId: '', from: '', to: '', query: '' } as const

  it('filters by query, category and date range, newest first', () => {
    expect(
      filterExpenses(expenses, { ...all, query: 'taco' }).map((e) => e.id),
    ).toEqual(['c', 'a'])
    expect(
      filterExpenses(expenses, { ...all, categoryId: 'car' }).map((e) => e.id),
    ).toEqual(['b'])
    expect(
      filterExpenses(expenses, {
        ...all,
        from: '2026-09-01',
        to: '2026-09-30',
      }).map((e) => e.id),
    ).toEqual(['b', 'a'])
  })
})
