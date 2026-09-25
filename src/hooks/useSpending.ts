import { useMemo } from 'react'
import { useBudget } from '../context/budget'
import { getSpending, type Spending } from '../services/budget'
import type { MonthKey } from '../types'

/** Memoized spending totals (overall and per category) for a month. */
export function useSpending(month: MonthKey): Spending {
  const { state } = useBudget()
  return useMemo(
    () => getSpending(state.expenses, month),
    [state.expenses, month],
  )
}
