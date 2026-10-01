import { useMemo } from 'react'
import { useBudget } from '../context/budget'
import { getMonthBalance, type MonthBalance } from '../services/balance'
import type { MonthKey } from '../types'

/** Memoized money summary of a month: available, spent, saved and left. */
export function useMonthBalance(month: MonthKey): MonthBalance {
  const { state } = useBudget()
  return useMemo(() => getMonthBalance(state, month), [state, month])
}
