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
      goals: {},
    })
    expect(state?.expenses).toEqual([])
    expect(state?.settings.theme).toBe('system')
  })
})

describe('normalizeState with savings goals', () => {
  it('adds empty goals to data saved before goals existed', () => {
    const state = normalizeState({
      categories: [],
      months: { '2026-09': { available: 1000, budgets: {} } },
    })
    expect(state?.goals).toEqual([])
    expect(state?.contributions).toEqual([])
    expect(state?.months['2026-09'].goals).toEqual({})
  })

  it('validates goals and drops contributions of unknown goals', () => {
    const state = normalizeState({
      categories: [],
      goals: [
        { id: 'g1', name: 'Viaje', target: 0, deadline: '12/2026', icon: 'x' },
        { id: 'g2', name: ' ' },
      ],
      contributions: [
        { id: 'c1', goalId: 'g1', amount: -50, date: '2026-09-01' },
        { id: 'c2', goalId: 'g1', amount: 0, date: '2026-09-01' },
        { id: 'c3', goalId: 'gone', amount: 10, date: '2026-09-01' },
      ],
      months: { '2026-09': { goals: { g1: 300, g2: -1 } } },
    })
    expect(state?.goals).toEqual([
      {
        id: 'g1',
        name: 'Viaje',
        target: null,
        deadline: null,
        startingBalance: 0,
        icon: 'target',
        color: '#3B82A0',
        createdAt: 0,
      },
    ])
    expect(state?.contributions.map((c) => c.id)).toEqual(['c1'])
    expect(state?.months['2026-09'].goals).toEqual({ g1: 300 })
  })

  it('turns month deadlines saved by the first goals version into dates', () => {
    const state = normalizeState({
      categories: [],
      goals: [{ id: 'g1', name: 'Viaje', deadline: '2026-02' }],
    })
    expect(state?.goals[0].deadline).toBe('2026-02-28')
  })
})
