import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { ExpenseItem } from '../../../components/ExpenseItem'
import { CategoryIcon, SheetContent } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { useDelayedFocus } from '../../../hooks/useDelayedFocus'
import { useSpending } from '../../../hooks/useSpending'
import {
  compareExpensesDesc,
  findCategory,
  getCategoryBudget,
  getRecentConcepts,
} from '../../../services/budget'
import { firstDayOfMonth, monthName, monthOf, today } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'
import { parseAmount } from '../../../utils/number'
import '../budget.css'

const RECENT_LIMIT = 5

/** Registers an expense in a category (the main quick-entry flow). */
export function CategorySheet({ categoryId }: { categoryId: string }) {
  const { state, actions } = useBudget()
  const { month, setMonth, openSheet, closeSheet } = useUi()
  const { showToast } = useToast()
  const conceptsId = useId()
  const amountRef = useRef<HTMLInputElement>(null)
  useDelayedFocus(amountRef)

  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const [date, setDate] = useState(() =>
    monthOf(today()) === month ? today() : firstDayOfMonth(month),
  )

  const category = findCategory(state.categories, categoryId)
  const budget = getCategoryBudget(state, month, categoryId)
  const spent = useSpending(month).byCategory[categoryId] ?? 0
  const concepts = useMemo(
    () => getRecentConcepts(state.expenses, categoryId),
    [state.expenses, categoryId],
  )
  const recent = useMemo(
    () =>
      state.expenses
        .filter((e) => e.categoryId === categoryId && monthOf(e.date) === month)
        .sort(compareExpensesDesc)
        .slice(0, RECENT_LIMIT),
    [state.expenses, categoryId, month],
  )

  if (!category) return null

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
    actions.addExpense({
      categoryId,
      amount: value,
      concept: concept.trim() || 'Gasto',
      date,
    })
    closeSheet()
    showToast(`Gasto guardado en ${category.name}`)
    if (monthOf(date) !== month) setMonth(monthOf(date))
  }

  let status =
    spent > 0
      ? `${formatMoney(spent)} gastados · sin presupuesto`
      : 'Sin presupuesto este mes'
  if (budget > 0) {
    status = `${formatMoney(spent)} de ${formatMoney(budget)} · ${
      spent > budget
        ? `excedido por ${formatMoney(spent - budget)}`
        : `restan ${formatMoney(budget - spent)}`
    }`
  }

  return (
    <SheetContent
      onClose={closeSheet}
      title={
        <span className="row">
          <CategoryIcon category={category} size={18} />
          {category.name}
        </span>
      }
    >
      <p className="sub">{status}</p>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Monto</span>
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
        <label className="field">
          <span>Concepto</span>
          <input
            className="input"
            list={conceptsId}
            placeholder="¿En qué gastaste?"
            maxLength={80}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
          <datalist id={conceptsId}>
            {concepts.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>Fecha</span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button className="btn full" type="submit">
          Guardar gasto
        </button>
      </form>
      <div className="row between mt">
        <button
          className="link"
          onClick={() => openSheet({ type: 'categoryBudget', categoryId })}
        >
          Presupuesto del mes
        </button>
        <button
          className="link muted"
          onClick={() => openSheet({ type: 'categoryForm', categoryId })}
        >
          Editar categoría
        </button>
      </div>
      {recent.length > 0 && (
        <>
          <div className="sec-title">
            <h2>Últimos gastos de {monthName(month)}</h2>
          </div>
          <div className="list">
            {recent.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={category}
                onSelect={(expenseId) =>
                  openSheet({ type: 'expense', expenseId })
                }
              />
            ))}
          </div>
        </>
      )}
    </SheetContent>
  )
}
