import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ExpenseFilters, MonthKey, SheetState, View } from '../../types'
import { currentMonth, firstDayOfMonth, lastDayOfMonth } from '../../utils/date'
import { UiContext, type ActiveSheet } from './UiContext'

const monthRange = (month: MonthKey) => ({
  from: firstDayOfMonth(month),
  to: lastDayOfMonth(month),
})

const initialFilters = (month: MonthKey): ExpenseFilters => ({
  categoryId: '',
  query: '',
  ...monthRange(month),
})

export function UiProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>('budget')
  const [month, setMonthState] = useState<MonthKey>(currentMonth)
  const [filters, setFilters] = useState(() => initialFilters(month))
  const [sheet, setSheet] = useState<ActiveSheet | null>(null)
  const [isSheetOpen, setSheetOpen] = useState(false)

  const setView = useCallback((next: View) => {
    setViewState(next)
    window.scrollTo({ top: 0 })
  }, [])

  const setMonth = useCallback((next: MonthKey) => {
    setMonthState(next)
    setFilters((current) => ({ ...current, ...monthRange(next) }))
  }, [])

  const updateFilters = useCallback((changes: Partial<ExpenseFilters>) => {
    setFilters((current) => ({ ...current, ...changes }))
  }, [])

  const openSheet = useCallback((state: SheetState) => {
    setSheet((current) => ({ state, key: (current?.key ?? 0) + 1 }))
    setSheetOpen(true)
  }, [])

  const closeSheet = useCallback(() => setSheetOpen(false), [])

  const value = useMemo(
    () => ({
      view,
      setView,
      month,
      setMonth,
      filters,
      updateFilters,
      sheet,
      isSheetOpen,
      openSheet,
      closeSheet,
    }),
    [
      view,
      setView,
      month,
      setMonth,
      filters,
      updateFilters,
      sheet,
      isSheetOpen,
      openSheet,
      closeSheet,
    ],
  )

  return <UiContext value={value}>{children}</UiContext>
}
