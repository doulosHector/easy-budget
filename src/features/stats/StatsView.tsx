import { useMemo } from 'react'
import { EmptyState } from '../../components/ui'
import { useBudget } from '../../context/budget'
import { useUi } from '../../context/ui'
import { useSpending } from '../../hooks/useSpending'
import { getMonth } from '../../services/budget'
import {
  getCategoryBreakdown,
  getDailySpending,
  getMonthlyAverages,
  getMonthSummary,
  getTopConcepts,
} from '../../services/stats'
import { dayOfMonth, monthOf, today } from '../../utils/date'
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard'
import { DailySpendingChart } from './components/DailySpendingChart'
import { MonthlyAverageCard } from './components/MonthlyAverageCard'
import { MonthSummaryCard } from './components/MonthSummaryCard'
import { TopConceptsCard } from './components/TopConceptsCard'
import './stats.css'

export function StatsView() {
  const { state } = useBudget()
  const { month } = useUi()
  const { categories, expenses } = state
  const spending = useSpending(month)
  const now = today()

  const summary = useMemo(
    () => getMonthSummary(expenses, month, now),
    [expenses, month, now],
  )
  const breakdown = useMemo(
    () => getCategoryBreakdown(categories, spending),
    [categories, spending],
  )
  const perDay = useMemo(
    () => getDailySpending(expenses, month),
    [expenses, month],
  )
  const concepts = useMemo(
    () => getTopConcepts(expenses, month),
    [expenses, month],
  )
  const averages = useMemo(
    () => getMonthlyAverages(categories, expenses, month),
    [categories, expenses, month],
  )

  if (!expenses.length) {
    return (
      <EmptyState title="Sin datos todavía">
        Cuando registres gastos verás aquí tus estadísticas.
      </EmptyState>
    )
  }

  return (
    <>
      <MonthSummaryCard
        summary={summary}
        available={getMonth(state, month).available}
      />
      <CategoryBreakdownCard month={month} rows={breakdown} />
      <DailySpendingChart
        perDay={perDay}
        dailyAverage={summary.dailyAverage}
        todayIndex={monthOf(now) === month ? dayOfMonth(now) - 1 : -1}
      />
      <TopConceptsCard concepts={concepts} />
      <MonthlyAverageCard averages={averages} />
    </>
  )
}
