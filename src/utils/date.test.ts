import { describe, expect, it } from 'vitest'
import {
  dayLabel,
  daysInMonth,
  isDateKey,
  lastDayOfMonth,
  monthLabel,
  shiftMonth,
} from './date'

describe('shiftMonth', () => {
  it('moves forward and backward across years', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-09', -12)).toBe('2025-09')
    expect(shiftMonth('2026-09', 0)).toBe('2026-09')
  })
})

describe('daysInMonth', () => {
  it('handles leap years', () => {
    expect(daysInMonth('2024-02')).toBe(29)
    expect(daysInMonth('2026-02')).toBe(28)
    expect(lastDayOfMonth('2026-09')).toBe('2026-09-30')
  })
})

describe('labels', () => {
  it('capitalizes the month label', () => {
    expect(monthLabel('2026-09')).toBe('Septiembre 2026')
  })

  it('uses relative names for today and yesterday', () => {
    const now = new Date(2026, 8, 25)
    expect(dayLabel('2026-09-25', now)).toBe('Hoy')
    expect(dayLabel('2026-09-24', now)).toBe('Ayer')
    expect(dayLabel('2026-09-01', now)).not.toMatch(/Hoy|Ayer|\./)
  })

  it('validates date keys', () => {
    expect(isDateKey('2026-09-25')).toBe(true)
    expect(isDateKey('25/09/2026')).toBe(false)
  })
})
