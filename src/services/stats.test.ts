import { describe, expect, it } from 'vitest'
import {
  budgetState,
  category,
  contribution,
  expense,
  goal,
  month,
} from '../test/factories'
import {
  elapsedDays,
  getDailySpending,
  getMonthlyAverages,
  getMonthSummary,
  getSavingsSummary,
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
  it('averages each category over its months with spending only', () => {
    const home = category({ id: 'cat-home', name: 'Casa' })
    const result = getMonthlyAverages(
      [category(), home],
      [
        expense({ amount: 100, date: '2025-10-01' }),
        expense({ amount: 200, date: '2026-09-01' }),
        expense({ amount: 50, date: '2026-09-15' }),
        expense({ amount: 900, date: '2026-03-01', categoryId: 'cat-home' }),
        expense({ amount: 999, date: '2025-09-30' }),
      ],
      '2026-09',
    )
    expect(result.months[0]).toBe('2025-10')
    expect(result.months).toHaveLength(12)
    expect(result.total).toBe(1250)
    // Overall: 3 months with spending (Oct, Mar and Sep), not 12.
    expect(result.activeMonths).toBe(3)
    expect(result.average).toBeCloseTo(1250 / 3)
    expect(result.rows).toEqual([
      { category: home, total: 900, activeMonths: 1, average: 900 },
      { category: category(), total: 350, activeMonths: 2, average: 175 },
    ])
  })
})

describe('getSavingsSummary', () => {
  it('summarizes the month savings and the total kept in goals', () => {
    const state = budgetState({
      goals: [goal()],
      months: {
        '2026-09': month({ available: 9500, goals: { 'goal-trip': 1500 } }),
      },
      contributions: [
        contribution({ amount: 4000, date: '2026-08-01' }),
        contribution({ amount: 1000 }),
        contribution({ amount: -500 }),
      ],
    })
    expect(getSavingsSummary(state, '2026-09')).toEqual({
      saved: 1000,
      withdrawn: 500,
      planned: 1500,
      total: 4500,
      // 1000 saved out of 9500 configured + 500 withdrawn.
      savedPercent: 10,
    })
    expect(getSavingsSummary(state, '2026-10').savedPercent).toBeNull()
  })
})
