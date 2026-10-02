import { Icon, StackedBar } from '../../../components/ui'
import { useUi } from '../../../context/ui'
import { useMonthBalance } from '../../../hooks/useMonthBalance'
import { monthLabel } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'
import { cx } from '../../../utils/style'
import { monthStatusHint } from '../monthStatus'

export function BudgetHero() {
  const { month, openSheet } = useUi()
  const balance = useMonthBalance(month)
  const openSetup = () => openSheet({ type: 'monthSetup' })

  if (balance.configured == null) {
    return (
      <section className="hero empty">
        <h2>Sin presupuesto para {monthLabel(month).toLowerCase()}</h2>
        <p>
          Define cuánto dinero tienes disponible y repártelo entre tus
          categorías y metas de ahorro.
          {balance.spent > 0 &&
            ` Ya llevas ${formatMoney(balance.spent)} gastados.`}
        </p>
        <button className="btn" onClick={openSetup}>
          Configurar mes
        </button>
      </section>
    )
  }

  const { available, assigned, spent, saved, withdrawn, used, left } = balance
  const percentOf = (amount: number) =>
    available > 0 ? (amount / available) * 100 : 0

  return (
    <section className="hero">
      <div className="hero-head">
        <h2 className="hero-label">Resumen</h2>
        {available > 0 && (
          <span className={cx('hero-percent', used > available && 'neg')}>
            {Math.round(percentOf(used))}% usado
          </span>
        )}
      </div>
      <StackedBar
        over={used > available}
        segments={[
          { value: percentOf(spent) },
          { value: percentOf(saved), className: 'save' },
        ]}
      />
      <div className="hero-meta">
        <span>
          Disponible<b>{formatMoney(available)}</b>
          {withdrawn > 0 && (
            <small>incluye {formatMoney(withdrawn)} retirados</small>
          )}
        </span>
        <span>
          <i className="dot spent" aria-hidden="true" />
          Gastado<b>{formatMoney(spent)}</b>
        </span>
        <span>
          Restante
          <b className={cx(left < 0 && 'neg')}>
            {left < 0 ? '−' : ''}
            {formatMoney(Math.abs(left))}
          </b>
        </span>
        <span>
          <i className="dot save" aria-hidden="true" />
          Ahorrado<b>{formatMoney(saved)}</b>
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
