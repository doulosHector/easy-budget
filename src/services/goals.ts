import type {
  BudgetState,
  Contribution,
  DateKey,
  Goal,
  MonthKey,
} from '../types'
import {
  firstDayOfMonth,
  monthOf,
  monthsBetween,
  shiftMonth,
} from '../utils/date'
import { sum } from '../utils/number'
import { getMonth } from './budget'

export interface Savings {
  /** Net amount moved into each goal during the month (withdrawals subtract). */
  byGoal: Record<string, number>
  /** Sum of the positive contributions. */
  saved: number
  /** Sum of the withdrawals, as a positive number. */
  withdrawn: number
}

export interface GoalSuggestions {
  /** Plan of the previous month. */
  last: number
  /**
   * Monthly amount needed to reach the target by the deadline, or `null`
   * when the goal has no target or no deadline.
   */
  onTime: number | null
}

export const findGoal = (
  goals: readonly Goal[],
  id: string,
): Goal | undefined => goals.find((g) => g.id === id)

/** Sum of a goal's contributions, optionally only those before `before`. */
export const getContributionsTotal = (
  contributions: readonly Contribution[],
  goalId: string,
  before?: DateKey,
): number =>
  sum(
    contributions
      .filter((c) => c.goalId === goalId && (!before || c.date < before))
      .map((c) => c.amount),
  )

/**
 * Money in a goal: its starting balance plus its contributions, optionally
 * only those before `before`.
 */
export const getGoalBalance = (
  contributions: readonly Contribution[],
  goal: Goal,
  before?: DateKey,
): number =>
  goal.startingBalance + getContributionsTotal(contributions, goal.id, before)

export const getSavings = (
  contributions: readonly Contribution[],
  month: MonthKey,
): Savings => {
  const byGoal: Record<string, number> = {}
  let saved = 0
  let withdrawn = 0
  for (const contribution of contributions) {
    if (monthOf(contribution.date) !== month) continue
    const { goalId, amount } = contribution
    byGoal[goalId] = (byGoal[goalId] ?? 0) + amount
    if (amount > 0) saved += amount
    else withdrawn -= amount
  }
  return { byGoal, saved, withdrawn }
}

export const getGoalPlan = (
  state: BudgetState,
  month: MonthKey,
  goalId: string,
): number => getMonth(state, month).goals[goalId] ?? 0

/** Sum of the plans of existing goals in a month. */
export const getGoalsPlanned = (state: BudgetState, month: MonthKey): number =>
  sum(state.goals.map((g) => getGoalPlan(state, month, g.id)))

/** Money still missing to reach the target at the start of `month`. */
export const getGoalMissing = (
  contributions: readonly Contribution[],
  goal: Goal,
  month: MonthKey,
): number =>
  goal.target == null
    ? 0
    : Math.max(
        0,
        goal.target -
          getGoalBalance(contributions, goal, firstDayOfMonth(month)),
      )

/**
 * Months left until the deadline, counting both `month` and the deadline's
 * month (at least 1).
 */
export const monthsLeft = (deadline: DateKey, month: MonthKey): number =>
  Math.max(1, monthsBetween(month, monthOf(deadline)) + 1)

/** Rounds up to cents, so following the suggestion never falls short. */
const ceilCents = (amount: number): number => Math.ceil(amount * 100) / 100

export const getGoalSuggestions = (
  state: BudgetState,
  month: MonthKey,
  goalId: string,
): GoalSuggestions => {
  const last = getGoalPlan(state, shiftMonth(month, -1), goalId)
  const goal = findGoal(state.goals, goalId)
  if (!goal || goal.target == null || !goal.deadline) {
    return { last, onTime: null }
  }
  const missing = getGoalMissing(state.contributions, goal, month)
  return {
    last,
    onTime: ceilCents(missing / monthsLeft(goal.deadline, month)),
  }
}

/** Contributions of a goal, newest first. */
export const getGoalHistory = (
  contributions: readonly Contribution[],
  goalId: string,
): Contribution[] =>
  contributions
    .filter((c) => c.goalId === goalId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
