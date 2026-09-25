import type { DateKey, MonthKey } from '../../types'
import { dayOfMonth, daysInMonth, monthOf, today } from '../../utils/date'
import { pluralize } from '../../utils/format'

/** Short hint about where `month` is relative to today. */
export const monthStatusHint = (
  month: MonthKey,
  now: DateKey = today(),
): string => {
  const current = monthOf(now)
  if (current !== month) return month < current ? 'Mes cerrado' : 'Mes futuro'
  const left = daysInMonth(month) - dayOfMonth(now)
  return left === 0
    ? 'Último día del mes'
    : `${pluralize(left, 'Queda', 'Quedan')} ${left} ${pluralize(left, 'día')}`
}
