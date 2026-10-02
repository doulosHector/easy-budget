import { LOCALE } from '../constants/locale'
import type { DateKey, MonthKey } from '../types'
import { capitalize } from './format'

export const pad2 = (n: number): string => String(n).padStart(2, '0')

export const toDateKey = (date: Date): DateKey =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const today = (): DateKey => toDateKey(new Date())

export const monthOf = (date: DateKey): MonthKey => date.slice(0, 7)

export const currentMonth = (): MonthKey => monthOf(today())

export const dayOfMonth = (date: DateKey): number => Number(date.slice(8, 10))

const parseMonth = (month: MonthKey): [year: number, month: number] => {
  const [year, monthNumber] = month.split('-').map(Number)
  return [year, monthNumber]
}

/** Moves a month key `delta` months forward (or backward when negative). */
export const shiftMonth = (month: MonthKey, delta: number): MonthKey => {
  const [year, monthNumber] = parseMonth(month)
  const date = new Date(year, monthNumber - 1 + delta, 1)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

/** Whole months from `from` to `to` (negative when `to` is earlier). */
export const monthsBetween = (from: MonthKey, to: MonthKey): number => {
  const [fromYear, fromMonth] = parseMonth(from)
  const [toYear, toMonth] = parseMonth(to)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

export const daysInMonth = (month: MonthKey): number => {
  const [year, monthNumber] = parseMonth(month)
  return new Date(year, monthNumber, 0).getDate()
}

export const firstDayOfMonth = (month: MonthKey): DateKey => `${month}-01`

export const lastDayOfMonth = (month: MonthKey): DateKey =>
  `${month}-${pad2(daysInMonth(month))}`

const monthDate = (month: MonthKey): Date => {
  const [year, monthNumber] = parseMonth(month)
  return new Date(year, monthNumber - 1, 1)
}

/** Month name, e.g. `septiembre`. */
export const monthName = (month: MonthKey): string =>
  monthDate(month).toLocaleDateString(LOCALE, { month: 'long' })

/** Full month label, e.g. `Septiembre 2026`. */
export const monthLabel = (month: MonthKey): string =>
  `${capitalize(monthName(month))} ${parseMonth(month)[0]}`

/** Compact month label, e.g. `sept 26`. */
export const monthShort = (month: MonthKey): string =>
  monthDate(month)
    .toLocaleDateString(LOCALE, { month: 'short', year: '2-digit' })
    .replace('.', '')

/** Human label for a day: `Hoy`, `Ayer` or e.g. `Jue 24 sept`. */
export const dayLabel = (date: DateKey, now: Date = new Date()): string => {
  if (date === toDateKey(now)) return 'Hoy'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date === toDateKey(yesterday)) return 'Ayer'
  const [year, month, day] = date.split('-').map(Number)
  return capitalize(
    new Date(year, month - 1, day)
      .toLocaleDateString(LOCALE, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      .replace(/\./g, ''),
  )
}

export const isDateKey = (value: string): value is DateKey =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)

export const isMonthKey = (value: string): value is MonthKey =>
  /^\d{4}-\d{2}$/.test(value)

/**
 * Reads a deadline: a `YYYY-MM-DD` date, or a `YYYY-MM` month (the format
 * used before deadlines had a day), which becomes the month's last day.
 */
export const parseDeadline = (value: string): DateKey | null => {
  if (isDateKey(value)) return value
  return isMonthKey(value) ? lastDayOfMonth(value) : null
}

const toDate = (date: DateKey): Date => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Compact date, e.g. `15 dic 26`. */
export const dateShort = (date: DateKey): string =>
  toDate(date)
    .toLocaleDateString(LOCALE, {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    })
    .replace(/\./g, '')

/** Full date, e.g. `15 de diciembre de 2026`. */
export const dateLong = (date: DateKey): string =>
  toDate(date).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
