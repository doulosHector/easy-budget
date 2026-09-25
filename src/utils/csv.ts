const BOM = '﻿'
const NEEDS_QUOTES = /[",\n\r]/

export const toCsvCell = (value: unknown): string => {
  const text = String(value ?? '')
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Serializes rows into CSV. Prefixed with a BOM so spreadsheet apps detect
 * UTF-8 correctly, and using CRLF line endings for maximum compatibility.
 */
export const toCsv = (rows: readonly (readonly unknown[])[]): string =>
  BOM + rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n')

export const stripBom = (text: string): string => text.replace(/^﻿/, '')

/** Parses CSV text (RFC 4180 style quoting). Blank rows are dropped. */
export const parseCsv = (input: string): string[][] => {
  const text = stripBom(input)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** Lowercases and strips accents so `Categoría` matches `categoria`. */
export const normalizeHeader = (header: string): string =>
  header.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
