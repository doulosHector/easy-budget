import { Icon, ProgressBar } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useUi } from '../../../context/ui'
import { useSpending } from '../../../hooks/useSpending'
import { getAssignedTotal, getMonth } from '../../../services/budget'
import { monthLabel } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'
import { cx } from '../../../utils/style'
import { monthStatusHint } from '../monthStatus'

export function BudgetHero() {
  const { state } = useBudget()
  const { month, openSheet } = useUi()
  const { total: spent } = useSpending(month)
  const { available } = getMonth(state, month)
  const openSetup = () => openSheet({ type: 'monthSetup' })

  if (available == null) {
    return (
      <section className="hero empty">
        <h2>Sin presupuesto para {monthLabel(month).toLowerCase()}</h2>
        <p>
          Define cuánto dinero tienes disponible y repártelo entre tus
          categorías.
          {spent > 0 && ` Ya llevas ${formatMoney(spent)} gastados.`}
        </p>
        <button className="btn" onClick={openSetup}>
          Configurar mes
        </button>
      </section>
    )
  }

  const assigned = getAssignedTotal(state, month)
  const left = available - spent
  const percent = available > 0 ? (spent / available) * 100 : 0

  return (
    <section className="hero">
      <p className="hero-label">{left < 0 ? 'Te pasaste por' : 'Te quedan'}</p>
      <p className={cx('hero-amount', left < 0 && 'neg')}>
        {formatMoney(Math.abs(left))}
      </p>
      <ProgressBar value={percent} over={spent > available} />
      <div className="hero-meta">
        <span>
          Disponible<b>{formatMoney(available)}</b>
        </span>
        <span>
          Asignado<b>{formatMoney(assigned)}</b>
        </span>
        <span>
          Gastado<b>{formatMoney(spent)}</b>
        </span>
      </div>
      {assigned > available && (
        <div className="warn">
          <Icon name="alert" size={16} strokeWidth={2} />
          <span>
            Asignaste {formatMoney(assigned - available)} más de lo disponible
            este mes.
          </span>
        </div>
      )}
      <div className="hero-actions">
        <span className="hint">{monthStatusHint(month)}</span>
        <button className="link" onClick={openSetup}>
          Configurar mes
        </button>
      </div>
    </section>
  )
}
