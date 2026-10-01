import type { SavingsSummary } from '../../../services/stats'
import type { MonthKey } from '../../../types'
import { monthLabel } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'

interface SavingsCardProps {
  month: MonthKey
  summary: SavingsSummary
}

export function SavingsCard({ month, summary }: SavingsCardProps) {
  const { saved, planned, withdrawn, total, savedPercent } = summary

  return (
    <div className="card">
      <h3>
        Ahorro<small>{monthLabel(month)}</small>
      </h3>
      <div className="kpi">
        <div>
          <span>Ahorrado</span>
          <b>{formatMoney(saved)}</b>
        </div>
        <div>
          <span>Planeado</span>
          <b>{formatMoney(planned)}</b>
        </div>
        <div>
          <span>Retirado</span>
          <b>{formatMoney(withdrawn)}</b>
        </div>
        <div>
          <span>Total en metas</span>
          <b>{formatMoney(total)}</b>
        </div>
      </div>
      {savedPercent != null && (
        <p className="delta save">
          Ahorraste el {savedPercent}% de tu disponible
        </p>
      )}
    </div>
  )
}
