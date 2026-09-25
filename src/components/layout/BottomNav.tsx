import { useUi } from '../../context/ui'
import type { View } from '../../types'
import { cx } from '../../utils/style'
import { Icon } from '../ui'
import './BottomNav.css'

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'budget', label: 'Presupuesto' },
  { view: 'expenses', label: 'Gastos' },
  { view: 'stats', label: 'Estadísticas' },
  { view: 'settings', label: 'Ajustes' },
]

export function BottomNav() {
  const { view: activeView, setView } = useUi()

  return (
    <nav className="nav" aria-label="Principal">
      <div className="nav-in">
        {NAV_ITEMS.map(({ view, label }) => (
          <button
            key={view}
            className={cx(view === activeView && 'on')}
            aria-current={view === activeView ? 'page' : undefined}
            onClick={() => setView(view)}
          >
            <Icon name={view} size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
