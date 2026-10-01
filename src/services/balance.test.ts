import { describe, expect, it } from 'vitest'
import {
  budgetState,
  contribution,
  expense,
  goal,
  month,
} from '../test/factories'
import { getMonthBalance } from './balance'

describe('getMonthBalance', () => {
  it('counts savings as used money and withdrawals as available money', () => {
    const state = budgetState({
      goals: [goal()],
      months: {
        '2026-09': month({
          available: 10000,
          budgets: { 'cat-food': 6000 },
          goals: { 'goal-trip': 2000 },
        }),
      },
      expenses: [expense({ amount: 4000 })],
      contributions: [
        contribution({ amount: 2000 }),
        contribution({ amount: -500 }),
      ],
    })
    expect(getMonthBalance(state, '2026-09')).toEqual({
      configured: 10000,
      withdrawn: 500,
      available: 10500,
      spent: 4000,
      saved: 2000,
      used: 6000,
      left: 4500,
      assigned: 8000,
    })
  })
})
