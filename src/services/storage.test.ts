import { describe, expect, it } from 'vitest'
import { normalizeState } from './storage'

describe('normalizeState', () => {
  it('rejects data without categories', () => {
    expect(normalizeState(null)).toBeNull()
    expect(normalizeState({ expenses: [] })).toBeNull()
  })

  it('migrates data saved by the original single-file app', () => {
    const state = normalizeState({
      categories: [{ id: 'c1', name: 'Casa', icon: 'home', color: '#3B82A0' }],
      months: { '2026-09': { available: 1000, budgets: { c1: 500 } } },
      expenses: [
        {
          id: 'e1',
          catId: 'c1',
          amount: 10,
          concept: 'Luz',
          date: '2026-09-01',
          createdAt: 5,
        },
      ],
      settings: { theme: 'dark' },
    })
    expect(state?.expenses[0]).toEqual({
      id: 'e1',
      categoryId: 'c1',
      amount: 10,
      concept: 'Luz',
      date: '2026-09-01',
      createdAt: 5,
    })
    expect(state?.settings.theme).toBe('dark')
  })

  it('repairs or drops invalid entries', () => {
    const state = normalizeState({
      categories: [{ id: 'c1', name: 'X', icon: 'rocket' }, { id: 'c2' }],
      months: { '2026-09': { available: 'lots', budgets: { c1: -5, c2: 20 } } },
      expenses: [
        { id: 'e1', categoryId: 'c1', amount: 'NaN', date: '2026-09-01' },
      ],
      settings: { theme: 'neon' },
    })
    expect(state?.categories).toEqual([
      { id: 'c1', name: 'X', icon: 'tag', color: '#3B82A0' },
    ])
    expect(state?.months['2026-09']).toEqual({
      available: null,
      budgets: { c2: 20 },
    })
    expect(state?.expenses).toEqual([])
    expect(state?.settings.theme).toBe('system')
  })
})
