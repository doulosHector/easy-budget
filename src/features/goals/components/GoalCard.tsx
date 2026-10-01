import { CategoryIcon, ProgressBar } from '../../../components/ui'
import type { Goal } from '../../../types'
import { formatMoney } from '../../../utils/format'
import { goalMonthText, goalProgress, goalTargetText } from '../format'

interface GoalCardProps {
  goal: Goal
  balance: number
  /** Planned contribution for the browsed month. */
  plan: number
  /** Net contribution in the browsed month. */
  net: number
  onSelect: () => void
}

export function GoalCard({
  goal,
  balance,
  plan,
  net,
  onSelect,
}: GoalCardProps) {
  const progress = goalProgress(goal, balance)
  const reached = progress != null && progress >= 100
  const planDone = plan > 0 && net >= plan

  return (
    <button className="cat" onClick={onSelect}>
      <CategoryIcon category={goal} />
      <span className="cat-body">
        <span className="cat-top">
          <span className="cat-name">{goal.name}</span>
          <span className="cat-left">{formatMoney(balance)}</span>
        </span>
        {progress != null && (
          <ProgressBar small value={progress} color={goal.color} />
        )}
        <span className="cat-sub">
          <span>{goalTargetText(goal)}</span>
          <span className={reached ? 'goal-done' : undefined}>
            {reached
              ? '¡Lograda!'
              : progress != null && `${Math.round(progress)}%`}
          </span>
        </span>
        <span className="cat-sub">
          <span>{goalMonthText(net, plan)}</span>
          {planDone && <span className="goal-done">Plan cumplido</span>}
        </span>
      </span>
    </button>
  )
}
