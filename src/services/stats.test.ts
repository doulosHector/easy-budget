import { describe, expect, it } from 'vitest'
import { category, expense } from '../test/factories'
import {
  elapsedDays,
  getDailySpending,
  getMonthlyAverages,
  getMonthSummary,
  getTopConcepts,
} from './stats'

describe('elapsedDays', () => {
  it('counts days for current, past and future months', () => {
    expect(elapsedDays('2026-09', '2026-09-25')).toBe(25)
    expect(elapsedDays('2026-08', '2026-09-25')).toBe(31)
    expect(elapsedDays('2026-10', '2026-09-25')).toBe(0)
  })
})

describe('getMonthSummary', () => {
  it('compares with the previous month', () => {
    const expenses = [
      expense({ amount: 300, date: '2026-09-05' }),
      expense({ amount: 200, date: '2026-08-05' }),
    ]
    expect(getMonthSummary(expenses, '2026-09', '2026-09-10')).toEqual({
      spent: 300,
      previousSpent: 200,
      diff: 100,
      diffPercent: 50,
      dailyAverage: 30,
      expenseCount: 1,
    })
  })
})

describe('getDailySpending', () => {
  it('returns one slot per day of the month', () => {
    const perDay = getDailySpending(
      [
        expense({ amount: 10, date: '2026-02-28' }),
        expense({ amount: 5, date: '2026-02-28' }),
      ],
      '2026-02',
    )
    expect(perDay).toHaveLength(28)
    expect(perDay[27]).toBe(15)
  })
})

describe('getTopConcepts', () => {
  it('groups concepts case-insensitively and sorts by total', () => {
    const expenses = [
      expense({ concept: 'Tacos', amount: 50 }),
      expense({ concept: 'tacos', amount: 70 }),
      expense({ concept: 'Super', amount: 100 }),
    ]
    expect(getTopConcepts(expenses, '2026-09')).toEqual([
      { name: 'Tacos', count: 2, total: 120 },
      { name: 'Super', count: 1, total: 100 },
    ])
  })
})

describe('getMonthlyAverages', () => {
  it('aggregates the last 12 months per category', () => {
    const result = getMonthlyAverages(
      [category()],
      [
        expense({ amount: 100, date: '2025-10-01' }),
        expense({ amount: 200, date: '2026-09-01' }),
        expense({ amount: 999, date: '2025-09-30' }),
      ],
      '2026-09',
    )
    expect(result.months[0]).toBe('2025-10')
    expect(result.months).toHaveLength(12)
    expect(result.total).toBe(300)
    expect(result.rows).toEqual([
      { category: category(), total: 300, activeMonths: 2 },
    ])
  })
})
