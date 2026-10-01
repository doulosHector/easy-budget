import type { BudgetState, MonthKey } from '../types'
import { getAssignedTotal, getMonth, getSpending } from './budget'
import { getGoalsPlanned, getSavings } from './goals'

export interface MonthBalance {
  /** Money configured for the month, or `null` when it was never set up. */
  configured: number | null
  /** Money taken out of goals this month, which becomes spendable. */
  withdrawn: number
  /** `configured` plus `withdrawn`. */
  available: number
  spent: number
  /** Money put into goals this month. */
  saved: number
  /** `spent` plus `saved`. */
  used: number
  /** `available` minus `used`; negative when overspent. */
  left: number
  /** Category budgets plus goal plans. */
  assigned: number
}

/**
 * The month's money at a glance. Contributions are kept apart from expenses:
 * saving uses money without counting as spending, and a withdrawal adds to
 * what is available instead of reducing the spending.
 */
export const getMonthBalance = (
  state: BudgetState,
  month: MonthKey,
): MonthBalance => {
  const configured = getMonth(state, month).available
  const { saved, withdrawn } = getSavings(state.contributions, month)
  const spent = getSpending(state.expenses, month).total
  const available = (configured ?? 0) + withdrawn
  const used = spent + saved
  return {
    configured,
    withdrawn,
    available,
    spent,
    saved,
    used,
    left: available - used,
    assigned: getAssignedTotal(state, month) + getGoalsPlanned(state, month),
  }
}
