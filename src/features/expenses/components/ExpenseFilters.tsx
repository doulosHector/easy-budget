import { Icon } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useUi } from '../../../context/ui'
import { cssVars, cx } from '../../../utils/style'

export function ExpenseFilters() {
  const { state } = useBudget()
  const { filters, updateFilters } = useUi()

  return (
    <div className="filters">
      <div className="search">
        <Icon name="search" size={18} strokeWidth={2} />
        <input
          className="input"
          type="search"
          placeholder="Buscar por concepto"
          aria-label="Buscar por concepto"
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
        />
      </div>
      <div className="chips" role="group" aria-label="Categoría">
        <button
          className={cx('chip', !filters.categoryId && 'on')}
          aria-pressed={!filters.categoryId}
          onClick={() => updateFilters({ categoryId: '' })}
        >
          Todas
        </button>
        {state.categories.map((category) => (
          <button
            key={category.id}
            className={cx('chip', filters.categoryId === category.id && 'on')}
            aria-pressed={filters.categoryId === category.id}
            style={cssVars({ '--c': category.color })}
            onClick={() => updateFilters({ categoryId: category.id })}
          >
            <span className="dot" />
            {category.name}
          </button>
        ))}
      </div>
      <div className="dates">
        <input
          className="input"
          type="date"
          aria-label="Desde"
          value={filters.from}
          onChange={(e) => updateFilters({ from: e.target.value })}
        />
        <span>a</span>
        <input
          className="input"
          type="date"
          aria-label="Hasta"
          value={filters.to}
          onChange={(e) => updateFilters({ to: e.target.value })}
        />
      </div>
    </div>
  )
}
