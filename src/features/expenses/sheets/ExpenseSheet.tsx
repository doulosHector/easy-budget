import { useId, useMemo, useState, type FormEvent } from 'react'
import { ConfirmButton, SheetContent } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { getRecentConcepts } from '../../../services/budget'
import { parseAmount, toInputValue } from '../../../utils/number'

/** Edits or deletes an existing expense. */
export function ExpenseSheet({ expenseId }: { expenseId: string }) {
  const { state, actions } = useBudget()
  const { closeSheet } = useUi()
  const { showToast } = useToast()
  const conceptsId = useId()
  const expense = state.expenses.find((e) => e.id === expenseId)

  const [amount, setAmount] = useState(
    expense ? toInputValue(expense.amount) : '',
  )
  const [concept, setConcept] = useState(expense?.concept ?? '')
  const [date, setDate] = useState(expense?.date ?? '')
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? '')
  const concepts = useMemo(
    () => getRecentConcepts(state.expenses, expense?.categoryId),
    [state.expenses, expense?.categoryId],
  )

  if (!expense) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = parseAmount(amount)
    if (value <= 0) {
      showToast('Escribe un monto mayor a 0')
      return
    }
    if (!date) {
      showToast('Elige una fecha')
      return
    }
    actions.updateExpense(expense.id, {
      amount: value,
      concept: concept.trim() || 'Gasto',
      date,
      categoryId,
    })
    closeSheet()
    showToast('Gasto actualizado')
  }

  const handleDelete = () => {
    actions.deleteExpense(expense.id)
    closeSheet()
    showToast('Gasto eliminado')
  }

  return (
    <SheetContent title="Editar gasto" onClose={closeSheet}>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Monto</span>
          <input
            className="input big"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Concepto</span>
          <input
            className="input"
            list={conceptsId}
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
        <div className="grid2">
          <label className="field">
            <span>Fecha</span>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Categoría</span>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn full" type="submit">
          Guardar cambios
        </button>
      </form>
      <ConfirmButton
        className="btn danger full mt"
        confirmLabel="Toca otra vez para eliminar"
        onConfirm={handleDelete}
      >
        Eliminar gasto
      </ConfirmButton>
    </SheetContent>
  )
}
