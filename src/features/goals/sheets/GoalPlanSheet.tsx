import { useState, type FormEvent } from 'react'
import { SuggestionChips } from '../../../components/SuggestionChips'
import { SheetContent } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import {
  findGoal,
  getGoalPlan,
  getGoalSuggestions,
  monthsLeft,
} from '../../../services/goals'
import { monthLabel } from '../../../utils/date'
import { formatMoney, pluralize } from '../../../utils/format'
import { parseAmount, toInputValue } from '../../../utils/number'
import { goalSuggestionOptions } from '../suggestions'

/** Sets how much to put into a goal in the browsed month. */
export function GoalPlanSheet({ goalId }: { goalId: string }) {
  const { state, actions } = useBudget()
  const { month, closeSheet } = useUi()
  const { showToast } = useToast()
  const current = getGoalPlan(state, month, goalId)
  const [amount, setAmount] = useState(current ? toInputValue(current) : '')

  const goal = findGoal(state.goals, goalId)
  if (!goal) return null
  const suggestions = getGoalSuggestions(state, month, goalId)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    actions.setGoalPlan(month, goalId, parseAmount(amount))
    closeSheet()
    showToast('Plan actualizado')
  }

  const months = goal.deadline ? monthsLeft(goal.deadline, month) : 0

  return (
    <SheetContent title={`Plan · ${goal.name}`} onClose={closeSheet}>
      <p className="sub">{monthLabel(month)}</p>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Monto a apartar este mes</span>
          <input
            className="input big"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <SuggestionChips
          options={goalSuggestionOptions(suggestions)}
          onPick={(value) => setAmount(toInputValue(value))}
        />
        {suggestions.onTime != null && goal.deadline && (
          <p className="hint mt">
            Para llegar a la meta en {monthLabel(goal.deadline).toLowerCase()}{' '}
            necesitas apartar {formatMoney(suggestions.onTime)} al mes durante{' '}
            {months} {pluralize(months, 'mes', 'meses')}.
          </p>
        )}
        <button className="btn full mt" type="submit">
          Guardar plan
        </button>
      </form>
    </SheetContent>
  )
}
