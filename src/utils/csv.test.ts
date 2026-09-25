import { describe, expect, it } from 'vitest'
import { normalizeHeader, parseCsv, toCsv } from './csv'

describe('csv', () => {
  it('round-trips values that need quoting', () => {
    const rows = [
      ['concepto', 'monto'],
      ['Tacos, "al pastor"', '120.00'],
      ['Línea\nnueva', '5'],
    ]
    const csv = toCsv(rows)
    expect(csv.startsWith('﻿')).toBe(true)
    expect(parseCsv(csv)).toEqual(rows)
  })

  it('accepts LF and CRLF line endings and drops blank rows', () => {
    expect(parseCsv('a,b\n1,2\r\n\r\n3,4')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ])
  })

  it('normalizes accented headers', () => {
    expect(normalizeHeader(' Categoría ')).toBe('categoria')
  })
})
