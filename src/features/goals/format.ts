import type { Goal } from '../../types'
import { dateShort } from '../../utils/date'
import { formatMoney } from '../../utils/format'

/** Share of the target already saved (0–100), or `null` without target. */
export const goalProgress = (goal: Goal, balance: number): number | null =>
  goal.target == null ? null : Math.min(100, (balance / goal.target) * 100)

/** E.g. `de $12,000.00 · para el 15 dic 26`. */
export const goalTargetText = (goal: Goal): string => {
  const parts = [
    goal.target == null ? 'Sin objetivo' : `de ${formatMoney(goal.target)}`,
  ]
  if (goal.deadline) parts.push(`para el ${dateShort(goal.deadline)}`)
  return parts.join(' · ')
}

/** This month's net contribution compared with its plan. */
export const goalMonthText = (net: number, plan: number): string => {
  if (plan > 0) return `Este mes ${formatMoney(net)} de ${formatMoney(plan)}`
  return net ? `Este mes ${formatMoney(net)} · sin plan` : 'Sin plan este mes'
}
