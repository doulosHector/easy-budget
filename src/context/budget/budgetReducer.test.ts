import { describe, expect, it } from 'vitest'
import {
  budgetState,
  category,
  contribution,
  expense,
  goal,
  month,
} from '../../test/factories'
import { budgetReducer } from './budgetReducer'

describe('budgetReducer', () => {
  it('deletes a category together with its expenses and budgets', () => {
    const state = budgetState({
      categories: [category(), category({ id: 'cat-home', name: 'Casa' })],
      months: {
        '2026-09': month({
          available: 1000,
          budgets: { 'cat-food': 100, 'cat-home': 200 },
        }),
      },
      expenses: [expense(), expense({ categoryId: 'cat-home' })],
    })
    const next = budgetReducer(state, {
      type: 'categoryDeleted',
      id: 'cat-food',
    })

    expect(next.categories.map((c) => c.id)).toEqual(['cat-home'])
    expect(next.expenses.map((e) => e.categoryId)).toEqual(['cat-home'])
    expect(next.months['2026-09'].budgets).toEqual({ 'cat-home': 200 })
    expect(state.categories).toHaveLength(2)
  })

  it('saves a month, removing budgets set to zero', () => {
    const state = budgetState({
      months: {
        '2026-09': month({
          available: 1000,
          budgets: { 'cat-food': 100, x: 5 },
        }),
      },
    })
    const next = budgetReducer(state, {
      type: 'monthSaved',
      month: '2026-09',
      available: null,
      budgets: { 'cat-food': 0, y: 50 },
      goals: {},
    })
    expect(next.months['2026-09']).toEqual({
      available: null,
      budgets: { x: 5, y: 50 },
      goals: {},
    })
  })

  it('adds a category with an optional initial budget', () => {
    const next = budgetReducer(budgetState({ categories: [] }), {
      type: 'categoryAdded',
      category: category(),
      month: '2026-09',
      budget: 300,
    })
    expect(next.categories).toHaveLength(1)
    expect(next.months['2026-09'].budgets).toEqual({ 'cat-food': 300 })
  })
})

describe('budgetReducer with savings goals', () => {
  it('deletes a goal together with its contributions and plans', () => {
    const state = budgetState({
      goals: [goal(), goal({ id: 'goal-car' })],
      contributions: [contribution(), contribution({ goalId: 'goal-car' })],
      months: {
        '2026-09': month({ goals: { 'goal-trip': 500, 'goal-car': 300 } }),
      },
    })
    const next = budgetReducer(state, { type: 'goalDeleted', id: 'goal-trip' })

    expect(next.goals.map((g) => g.id)).toEqual(['goal-car'])
    expect(next.contributions.map((c) => c.goalId)).toEqual(['goal-car'])
    expect(next.months['2026-09'].goals).toEqual({ 'goal-car': 300 })
  })

  it('saves category budgets and goal plans together', () => {
    const state = budgetState({
      months: { '2026-09': month({ goals: { 'goal-trip': 500 } }) },
    })
    const next = budgetReducer(state, {
      type: 'monthSaved',
      month: '2026-09',
      available: 1000,
      budgets: { 'cat-food': 400 },
      goals: { 'goal-trip': 0, 'goal-car': 200 },
    })
    expect(next.months['2026-09']).toEqual({
      available: 1000,
      budgets: { 'cat-food': 400 },
      goals: { 'goal-car': 200 },
    })
  })

  it('adds and deletes contributions', () => {
    const added = budgetReducer(budgetState(), {
      type: 'contributionAdded',
      contribution: contribution({ id: 'x' }),
    })
    expect(added.contributions).toHaveLength(1)
    const deleted = budgetReducer(added, {
      type: 'contributionDeleted',
      id: 'x',
    })
    expect(deleted.contributions).toEqual([])
  })
})
