import { describe, expect, it } from 'vitest'
import { budgetState, category, expense, month } from '../test/factories'
import { exportBudgetsCsv, exportExpensesCsv, importCsv } from './backup'

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
