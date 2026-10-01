import { EmptyState, Icon } from '../../components/ui'
import { useBudget } from '../../context/budget'
import { useUi } from '../../context/ui'
import { useSpending } from '../../hooks/useSpending'
import { getCategoryBudget } from '../../services/budget'
import { GoalsSection } from '../goals'
import { BudgetHero } from './components/BudgetHero'
import { CategoryCard } from './components/CategoryCard'
import './budget.css'

export function BudgetView() {
  const { state } = useBudget()
  const { month, openSheet } = useUi()
  const spending = useSpending(month)

  return (
    <>
      <BudgetHero />
      <div className="sec-title">
        <h2>Categorías</h2>
        <span className="hint">Toca una para registrar un gasto</span>
      </div>
      <ul className="cats">
        {state.categories.length ? (
          state.categories.map((category) => (
            <li key={category.id}>
              <CategoryCard
                category={category}
                budget={getCategoryBudget(state, month, category.id)}
                spent={spending.byCategory[category.id] ?? 0}
                onSelect={() =>
                  openSheet({ type: 'category', categoryId: category.id })
                }
              />
            </li>
          ))
        ) : (
          <EmptyState as="li" title="Sin categorías">
            Crea la primera para empezar a presupuestar.
          </EmptyState>
        )}
      </ul>
      <button
        className="btn ghost full mt"
        onClick={() => openSheet({ type: 'categoryForm', categoryId: null })}
      >
        <Icon name="plus" size={18} strokeWidth={2.2} /> Nueva categoría
      </button>
      <GoalsSection />
    </>
  )
}
