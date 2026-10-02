import { describe, expect, it } from 'vitest'
import { budgetState, contribution, goal, month } from '../test/factories'
import {
  getGoalBalance,
  getGoalHistory,
  getGoalsPlanned,
  getGoalSuggestions,
  getSavings,
  monthsLeft,
} from './goals'

const contributions = [
  contribution({ id: 'a', amount: 3000, date: '2026-08-05' }),
  contribution({ id: 'b', amount: 1000, date: '2026-09-02' }),
  contribution({ id: 'c', amount: -400, date: '2026-09-20' }),
  contribution({ id: 'd', goalId: 'other', amount: 50, date: '2026-09-03' }),
]

describe('getGoalBalance', () => {
  it('sums all movements, or only those before a date', () => {
    expect(getGoalBalance(contributions, 'goal-trip')).toBe(3600)
    expect(getGoalBalance(contributions, 'goal-trip', '2026-09-01')).toBe(3000)
  })
})

describe('getSavings', () => {
  it('returns the net per goal and the totals saved and withdrawn', () => {
    expect(getSavings(contributions, '2026-09')).toEqual({
      byGoal: { 'goal-trip': 600, other: 50 },
      saved: 1050,
      withdrawn: 400,
    })
  })
})

describe('getGoalsPlanned', () => {
  it('ignores plans of goals that no longer exist', () => {
    const state = budgetState({
      goals: [goal()],
      months: { '2026-09': month({ goals: { 'goal-trip': 500, gone: 90 } }) },
    })
    expect(getGoalsPlanned(state, '2026-09')).toBe(500)
  })
})

describe('getGoalSuggestions', () => {
  it('suggests last plan and the amount to finish on time', () => {
    const state = budgetState({
      goals: [goal({ target: 12000, deadline: '2026-12-15' })],
      contributions,
      months: { '2026-08': month({ goals: { 'goal-trip': 2500 } }) },
    })
    // 12000 - 3000 saved before September, over Sep, Oct, Nov and Dec.
    expect(getGoalSuggestions(state, '2026-09', 'goal-trip')).toEqual({
      last: 2500,
      onTime: 2250,
    })
  })

  it('rounds up to cents and asks for everything once the deadline passed', () => {
    const state = budgetState({
      goals: [goal({ target: 1000, deadline: '2026-11-30' })],
    })
    expect(getGoalSuggestions(state, '2026-09', 'goal-trip').onTime).toBe(
      333.34,
    )
    expect(getGoalSuggestions(state, '2027-01', 'goal-trip').onTime).toBe(1000)
  })

  it('has no on-time amount without target or deadline', () => {
    const state = budgetState({ goals: [goal({ deadline: null })] })
    expect(getGoalSuggestions(state, '2026-09', 'goal-trip').onTime).toBeNull()
  })
})

describe('monthsLeft', () => {
  it('counts the current month and never returns less than 1', () => {
    expect(monthsLeft('2026-12-15', '2026-09')).toBe(4)
    expect(monthsLeft('2026-09-01', '2026-09')).toBe(1)
    expect(monthsLeft('2026-01-31', '2026-09')).toBe(1)
  })
})

describe('getGoalHistory', () => {
  it('lists a goal movements newest first', () => {
    expect(getGoalHistory(contributions, 'goal-trip').map((c) => c.id)).toEqual(
      ['c', 'b', 'a'],
    )
  })
})
