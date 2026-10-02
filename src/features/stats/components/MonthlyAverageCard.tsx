import { CategoryIcon } from '../../../components/ui'
import type { MonthlyAverages } from '../../../services/stats'
import { monthShort } from '../../../utils/date'
import { formatMoney, pluralize } from '../../../utils/format'

export function MonthlyAverageCard({
  averages,
}: {
  averages: MonthlyAverages
}) {
  const { months, total, activeMonths, average, rows } = averages
  const span = months.length

  return (
    <div className="card">
      <h3>
        Promedio mensual por categoría
        <small>
          Últimos {span} meses ({monthShort(months[0])} –{' '}
          {monthShort(months[span - 1])}) · total {formatMoney(total)} ·{' '}
          {formatMoney(average)} al mes en {activeMonths}{' '}
          {pluralize(activeMonths, 'mes', 'meses')} con gasto
        </small>
      </h3>
      {rows.length ? (
        <table className="tbl">
          <tbody>
            {rows.map(({ category, total, activeMonths, average }) => (
              <tr key={category.id}>
                <td>
                  <div className="name">
                    <CategoryIcon category={category} size={14} />
                    <div>
                      {category.name}
                      <small>
                        {activeMonths} {pluralize(activeMonths, 'mes', 'meses')}{' '}
                        con gasto
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  {formatMoney(average)}
                  <small>{formatMoney(total)} en total</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="hint">Sin gastos en este periodo.</p>
      )}
    </div>
  )
}
