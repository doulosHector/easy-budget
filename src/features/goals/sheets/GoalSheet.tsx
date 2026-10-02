import { useMemo, useRef, useState, type FormEvent } from 'react'
import { SuggestionChips } from '../../../components/SuggestionChips'
import {
  CategoryIcon,
  ConfirmButton,
  SheetContent,
} from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { useDelayedFocus } from '../../../hooks/useDelayedFocus'
import {
  findGoal,
  getGoalBalance,
  getGoalHistory,
  getGoalPlan,
  getSavings,
} from '../../../services/goals'
import type { Contribution } from '../../../types'
import {
  dateLong,
  dayLabel,
  firstDayOfMonth,
  monthName,
  monthOf,
  today,
} from '../../../utils/date'
import { formatMoney } from '../../../utils/format'
import { parseAmount, toInputValue } from '../../../utils/number'
import { cx } from '../../../utils/style'
import '../goals.css'

type Direction = 'in' | 'out'

/** Contributes to or withdraws from a goal, and shows its movements. */
export function GoalSheet({ goalId }: { goalId: string }) {
  const { state, actions } = useBudget()
  const { month, setMonth, openSheet, closeSheet } = useUi()
  const { showToast } = useToast()
  const amountRef = useRef<HTMLInputElement>(null)
  useDelayedFocus(amountRef)

  const [direction, setDirection] = useState<Direction>('in')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() =>
    monthOf(today()) === month ? today() : firstDayOfMonth(month),
  )

  const { contributions } = state
  const goal = findGoal(state.goals, goalId)
  const balance = goal ? getGoalBalance(contributions, goal) : 0
  const plan = getGoalPlan(state, month, goalId)
  const net = getSavings(contributions, month).byGoal[goalId] ?? 0
  const history = useMemo(
    () => getGoalHistory(contributions, goalId),
    [contributions, goalId],
  )

  if (!goal) return null

  const missing = goal.target == null ? 0 : Math.max(0, goal.target - balance)
  const suggestions =
    direction === 'in'
      ? [
          ...(plan - net > 0
            ? [{ key: 'plan', label: 'Resto del plan', amount: plan - net }]
            : []),
          ...(missing > 0
            ? [{ key: 'missing', label: 'Lo que falta', amount: missing }]
            : []),
        ]
      : balance > 0
        ? [{ key: 'all', label: 'Todo', amount: balance }]
        : []

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = parseAmount(amount)
    if (value <= 0) {
      showToast('Escribe un monto mayor a 0')
      amountRef.current?.focus()
      return
    }
    if (!date) {
      showToast('Elige una fecha')
      return
    }
    if (direction === 'out' && value > balance + 0.005) {
      showToast(`Solo tienes ${formatMoney(balance)} en esta meta`)
      return
    }
    actions.addContribution({
      goalId,
      amount: direction === 'in' ? value : -value,
      date,
    })
    closeSheet()
    showToast(
      direction === 'in'
        ? `Aportaste ${formatMoney(value)} a ${goal.name}`
        : `Retiraste ${formatMoney(value)} de ${goal.name}`,
    )
    if (monthOf(date) !== month) setMonth(monthOf(date))
  }

  const handleDelete = (contribution: Contribution) => {
    if (balance - contribution.amount < -0.005) {
      showToast('No se puede borrar: la meta quedaría en negativo')
      return
    }
    actions.deleteContribution(contribution.id)
    showToast('Movimiento eliminado')
  }

  let status = `${formatMoney(balance)} ahorrados`
  if (goal.target != null) {
    status = `${formatMoney(balance)} de ${formatMoney(goal.target)} · ${
      missing > 0 ? `faltan ${formatMoney(missing)}` : '¡meta lograda!'
    }`
  }
  if (goal.deadline) {
    status += ` · para el ${dateLong(goal.deadline)}`
  }

  return (
    <SheetContent
      onClose={closeSheet}
      title={
        <span className="row">
          <CategoryIcon category={goal} size={18} />
          {goal.name}
        </span>
      }
    >
      <p className="sub">{status}</p>
      <form onSubmit={handleSubmit}>
        <div
          className="seg two goal-direction"
          role="group"
          aria-label="Movimiento"
        >
          {(
            [
              ['in', 'Aportar'],
              ['out', 'Retirar'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cx(direction === value && 'on')}
              aria-pressed={direction === value}
              onClick={() => setDirection(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>
            {direction === 'in' ? 'Monto a aportar' : 'Monto a retirar'}
          </span>
          <input
            ref={amountRef}
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
        {suggestions.length > 0 && (
          <SuggestionChips
            options={suggestions}
            onPick={(value) => setAmount(toInputValue(value))}
          />
        )}
        <label className="field mt">
          <span>Fecha</span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button className="btn full" type="submit">
          {direction === 'in' ? 'Guardar aportación' : 'Guardar retiro'}
        </button>
      </form>
      <div className="row between mt">
        <button
          className="link"
          onClick={() => openSheet({ type: 'goalPlan', goalId })}
        >
          {plan > 0
            ? `Plan de ${monthName(month)}: ${formatMoney(plan)}`
            : 'Plan del mes'}
        </button>
        <button
          className="link muted"
          onClick={() => openSheet({ type: 'goalForm', goalId })}
        >
          Editar meta
        </button>
      </div>
      {history.length > 0 && (
        <>
          <div className="sec-title">
            <h2>Movimientos</h2>
          </div>
          <div className="list">
            {history.map((contribution) => (
              <div className="item movement" key={contribution.id}>
                <span className="item-body">
                  <span className="item-title">
                    {contribution.amount > 0 ? 'Aportación' : 'Retiro'}
                  </span>
                  <span className="item-sub">
                    {dayLabel(contribution.date)}
                  </span>
                </span>
                <span
                  className={cx('item-amt', contribution.amount > 0 && 'in')}
                >
                  {contribution.amount > 0 ? '+' : '−'}
                  {formatMoney(Math.abs(contribution.amount))}
                </span>
                <ConfirmButton
                  className="btn danger sm"
                  confirmLabel="¿Seguro?"
                  onConfirm={() => handleDelete(contribution)}
                >
                  Borrar
                </ConfirmButton>
              </div>
            ))}
          </div>
        </>
      )}
    </SheetContent>
  )
}
