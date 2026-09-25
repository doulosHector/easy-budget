import { useUi } from '../../context/ui'
import { currentMonth, monthLabel, shiftMonth } from '../../utils/date'
import { cx } from '../../utils/style'
import { Icon } from '../ui'

export function MonthNav() {
  const { month, setMonth } = useUi()
  const isCurrent = month === currentMonth()

  return (
    <div className="monthnav">
      <button
        aria-label="Mes anterior"
        onClick={() => setMonth(shiftMonth(month, -1))}
      >
        <Icon name="chevronLeft" size={18} strokeWidth={2} />
      </button>
      <button
        className={cx('mlabel', !isCurrent && 'off')}
        title="Ir al mes actual"
        aria-live="polite"
        onClick={() => setMonth(currentMonth())}
      >
        {monthLabel(month)}
      </button>
      <button
        aria-label="Mes siguiente"
        onClick={() => setMonth(shiftMonth(month, 1))}
      >
        <Icon name="chevronRight" size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
