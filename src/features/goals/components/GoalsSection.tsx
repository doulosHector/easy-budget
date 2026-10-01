import { useMemo } from 'react'
import { EmptyState, Icon } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useUi } from '../../../context/ui'
import {
  getGoalBalance,
  getGoalPlan,
  getSavings,
} from '../../../services/goals'
import { GoalCard } from './GoalCard'
import '../goals.css'

/** "Metas de ahorro" list on the budget screen. */
export function GoalsSection() {
  const { state } = useBudget()
  const { month, openSheet } = useUi()
  const { goals, contributions } = state
  const savings = useMemo(
    () => getSavings(contributions, month),
    [contributions, month],
  )

  return (
    <>
      <div className="sec-title">
        <h2>Metas de ahorro</h2>
        {goals.length > 0 && (
          <span className="hint">Toca una para aportar</span>
        )}
      </div>
      <ul className="cats">
        {goals.length ? (
          goals.map((goal) => (
            <li key={goal.id}>
              <GoalCard
                goal={goal}
                balance={getGoalBalance(contributions, goal.id)}
                plan={getGoalPlan(state, month, goal.id)}
                net={savings.byGoal[goal.id] ?? 0}
                onSelect={() => openSheet({ type: 'goal', goalId: goal.id })}
              />
            </li>
          ))
        ) : (
          <EmptyState as="li" title="Sin metas">
            Aparta dinero cada mes para un viaje, un fondo de emergencia o lo
            que quieras.
          </EmptyState>
        )}
      </ul>
      <button
        className="btn ghost full mt"
        onClick={() => openSheet({ type: 'goalForm', goalId: null })}
      >
        <Icon name="plus" size={18} strokeWidth={2.2} /> Nueva meta
      </button>
    </>
  )
}
