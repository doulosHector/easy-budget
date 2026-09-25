import type { MonthSummary } from '../../../services/stats'
import { formatMoney } from '../../../utils/format'

interface MonthSummaryCardProps {
  summary: MonthSummary
  available: number | null
}

export function MonthSummaryCard({
  summary,
  available,
}: MonthSummaryCardProps) {
  const { spent, previousSpent, diff, diffPercent, dailyAverage } = summary

  let lastLabel = 'Gastos registrados'
  let lastValue: string | number = summary.expenseCount
  if (available != null) {
    lastLabel = 'Del disponible'
    lastValue =
      available > 0 ? `${Math.round((spent / available) * 100)}%` : '—'
  }

  return (
    <div className="card">
      <h3>Resumen del mes</h3>
      <div className="kpi">
        <div>
          <span>Gastado</span>
          <b>{formatMoney(spent)}</b>
        </div>
        <div>
          <span>Mes pasado</span>
          <b>{formatMoney(previousSpent)}</b>
        </div>
        <div>
          <span>Promedio diario</span>
          <b>{formatMoney(dailyAverage)}</b>
        </div>
        <div>
          <span>{lastLabel}</span>
          <b>{lastValue}</b>
        </div>
      </div>
      {diffPercent != null && (
        <p className={`delta ${diff > 0 ? 'up' : 'down'}`}>
          {diff > 0 ? '▲' : '▼'} {Math.abs(diffPercent)}% (
          {formatMoney(Math.abs(diff))}) {diff > 0 ? 'más' : 'menos'} que el mes
          pasado
        </p>
      )}
    </div>
  )
}
