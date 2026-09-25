import { useBudget } from '../../../context/budget'
import type { ThemePreference } from '../../../types'
import { cx } from '../../../utils/style'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

export function ThemeCard() {
  const { state, actions } = useBudget()
  const { theme } = state.settings

  return (
    <div className="card">
      <h3>Tema</h3>
      <div className="seg" role="group" aria-label="Tema">
        {THEME_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={cx(theme === value && 'on')}
            aria-pressed={theme === value}
            onClick={() => actions.setTheme(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
