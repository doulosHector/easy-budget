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
  exportBudgetsCsv,
  exportExpensesCsv,
  exportGoalsCsv,
  importCsv,
} from './backup'

const lines = (csv: string) => csv.replace('\uFEFF', '').split('\r\n')

describe('expenses CSV', () => {
  const state = budgetState({
    expenses: [
      expense({
        concept: 'Tacos, "al pastor"',
        amount: 85.5,
        date: '2026-09-02',
      }),
      expense({ concept: 'Super', amount: 1200, date: '2026-09-01' }),
    ],
  })

  it('exports oldest first with category names', () => {
    const lines = exportExpensesCsv(state).replace('﻿', '').split('\r\n')
    expect(lines).toEqual([
      'fecha,categoria,concepto,monto',
      '2026-09-01,Comida,Super,1200.00',
      '2026-09-02,Comida,"Tacos, ""al pastor""",85.50',
    ])
  })

  it('imports into another device, creating missing categories', () => {
    const empty = budgetState({ categories: [] })
    const { state: imported, result } = importCsv(
      empty,
      exportExpensesCsv(state),
    )
    expect(result).toEqual({ kind: 'expenses', added: 2, skipped: 0 })
    expect(imported.categories.map((c) => c.name)).toEqual(['Comida'])
    expect(imported.expenses).toHaveLength(2)
    expect(empty.expenses).toHaveLength(0)
  })

  it('skips duplicated and invalid rows', () => {
    const csv = `${exportExpensesCsv(state)}\r\nno-date,Comida,X,10\r\n2026-09-03,Comida,Y,0`
    const { result } = importCsv(state, csv)
    expect(result).toEqual({ kind: 'expenses', added: 0, skipped: 4 })
  })
})

describe('budgets CSV', () => {
  it('round-trips available money and budgets per category', () => {
    const state = budgetState({
      categories: [category(), category({ id: 'cat-home', name: 'Casa' })],
      months: {
        '2026-08': month({ available: 20000, budgets: {} }),
        '2026-09': month({
          available: 21000,
          budgets: { 'cat-food': 5000, 'cat-home': 8000 },
        }),
      },
    })
    const target = budgetState({ categories: [category({ id: 'other-id' })] })
    const { state: imported, result } = importCsv(
      target,
      exportBudgetsCsv(state),
    )

    expect(result).toEqual({ kind: 'budgets', rows: 3 })
    expect(imported.months['2026-08']).toEqual({
      available: 20000,
      budgets: {},
      goals: {},
    })
    const home = imported.categories.find((c) => c.name === 'Casa')!
    expect(imported.months['2026-09']).toEqual({
      available: 21000,
      budgets: { 'other-id': 5000, [home.id]: 8000 },
      goals: {},
    })
  })
})

describe('importCsv', () => {
  it('reports empty and unknown files without changing the state', () => {
    const state = budgetState()
    expect(importCsv(state, 'fecha,monto').result).toEqual({ kind: 'empty' })
    const unknown = importCsv(state, 'foo,bar\n1,2')
    expect(unknown.result).toEqual({ kind: 'unknown' })
    expect(unknown.state).toBe(state)
  })
})

describe('budgets CSV with goal plans', () => {
  const state = budgetState({
    goals: [goal()],
    months: {
      '2026-09': month({
        available: 21000,
        budgets: { 'cat-food': 5000 },
        goals: { 'goal-trip': 2000 },
      }),
    },
  })

  it('tells category budgets from goal plans with the tipo column', () => {
    expect(lines(exportBudgetsCsv(state))).toEqual([
      'mes,disponible,tipo,nombre,presupuesto',
      '2026-09,21000.00,categoria,Comida,5000.00',
      '2026-09,21000.00,meta,Viaje,2000.00',
    ])
  })

  it('round-trips goal plans, creating missing goals', () => {
    const target = budgetState({ categories: [] })
    const { state: imported } = importCsv(target, exportBudgetsCsv(state))
    const trip = imported.goals.find((g) => g.name === 'Viaje')!
    expect(imported.months['2026-09'].goals).toEqual({ [trip.id]: 2000 })
  })

  it('still accepts the format exported before goals existed', () => {
    const csv = 'mes,disponible,categoria,presupuesto\n2026-09,1000,Comida,400'
    const { state: imported, result } = importCsv(budgetState(), csv)
    expect(result).toEqual({ kind: 'budgets', rows: 1 })
    expect(imported.months['2026-09']).toEqual(
      month({ available: 1000, budgets: { 'cat-food': 400 } }),
    )
  })
})

describe('goals CSV', () => {
  const state = budgetState({
    goals: [
      goal(),
      goal({ id: 'goal-fund', name: 'Fondo', target: null, deadline: null }),
    ],
    contributions: [
      contribution({ amount: -300, date: '2026-09-20', createdAt: 2 }),
      contribution({ amount: 1000, date: '2026-09-02' }),
    ],
  })

  it('exports one row per movement and one for goals without movements', () => {
    expect(lines(exportGoalsCsv(state))).toEqual([
      'meta,objetivo,fecha_limite,fecha,tipo,monto',
      'Viaje,12000.00,2026-12-31,2026-09-02,aportacion,1000.00',
      'Viaje,12000.00,2026-12-31,2026-09-20,retiro,300.00',
      'Fondo,,,,,',
    ])
  })

  it('round-trips goals and signed movements into an empty state', () => {
    const empty = budgetState({ categories: [] })
    const { state: imported, result } = importCsv(empty, exportGoalsCsv(state))
    expect(result).toEqual({ kind: 'goals', goals: 2, added: 2, skipped: 0 })
    expect(imported.goals.map((g) => [g.name, g.target, g.deadline])).toEqual([
      ['Viaje', 12000, '2026-12-31'],
      ['Fondo', null, null],
    ])
    expect(imported.contributions.map((c) => c.amount)).toEqual([1000, -300])
  })

  it('skips duplicates and fills in what an existing goal was missing', () => {
    const existing = budgetState({
      goals: [goal({ target: null, deadline: null })],
      contributions: [contribution({ amount: 1000, date: '2026-09-02' })],
    })
    const { state: imported, result } = importCsv(
      existing,
      exportGoalsCsv(state),
    )
    expect(result).toEqual({ kind: 'goals', goals: 1, added: 1, skipped: 1 })
    expect(imported.goals[0]).toMatchObject({
      target: 12000,
      deadline: '2026-12-31',
    })
  })

  it('reads month deadlines from files exported by the first goals version', () => {
    const csv =
      'meta,objetivo,fecha_limite,fecha,tipo,monto\nAuto,50000,2027-06,,,'
    const { state: imported } = importCsv(budgetState(), csv)
    expect(imported.goals[0].deadline).toBe('2027-06-30')
  })

  it('round-trips a starting balance without adding it twice', () => {
    const start = budgetState({ goals: [goal({ startingBalance: 2500 })] })
    const csv = exportGoalsCsv(start)
    expect(lines(csv)[1]).toBe(
      'Viaje,12000.00,2026-12-31,,saldo_inicial,2500.00',
    )
    const once = importCsv(budgetState(), csv).state
    const twice = importCsv(once, csv).state
    expect(twice.goals.map((g) => g.startingBalance)).toEqual([2500])
    expect(twice.contributions).toEqual([])
  })
})
