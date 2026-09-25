import { CategoryIcon, ProgressBar } from '../../../components/ui'
import type { CategoryShare } from '../../../services/stats'
import type { MonthKey } from '../../../types'
import { monthLabel } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'

interface CategoryBreakdownCardProps {
  month: MonthKey
  rows: CategoryShare[]
}

export function CategoryBreakdownCard({
  month,
  rows,
}: CategoryBreakdownCardProps) {
  const max = rows[0]?.spent || 1

  return (
    <div className="card">
      <h3>
        Gasto por categoría<small>{monthLabel(month)}</small>
      </h3>
      {rows.length ? (
        <div className="hbars">
          {rows.map(({ category, spent, percent }) => (
            <div className="hbar" key={category.id}>
              <CategoryIcon category={category} size={15} />
              <div className="hbar-mid">
                <div className="hbar-top">
                  <span>{category.name}</span>
                  <span>
                    {formatMoney(spent)}
                    <small>{Math.round(percent)}%</small>
                  </span>
                </div>
                <ProgressBar
                  small
                  value={(spent / max) * 100}
                  color={category.color}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="hint">Sin gastos este mes.</p>
      )}
    </div>
  )
}
