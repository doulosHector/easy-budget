import { useState, type FormEvent } from 'react'
import { SheetContent } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import {
  findCategory,
  getCategoryBudget,
  getSuggestions,
} from '../../../services/budget'
import { monthLabel } from '../../../utils/date'
import { parseAmount, toInputValue } from '../../../utils/number'
import { SuggestionChips } from '../components/SuggestionChips'

/** Sets the budget of a single category for the browsed month. */
export function CategoryBudgetSheet({ categoryId }: { categoryId: string }) {
  const { state, actions } = useBudget()
  const { month, closeSheet } = useUi()
  const { showToast } = useToast()
  const current = getCategoryBudget(state, month, categoryId)
  const [amount, setAmount] = useState(current ? toInputValue(current) : '')

  const category = findCategory(state.categories, categoryId)
  if (!category) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    actions.setCategoryBudget(month, categoryId, parseAmount(amount))
    closeSheet()
    showToast('Presupuesto actualizado')
  }

  return (
    <SheetContent title={`Presupuesto · ${category.name}`} onClose={closeSheet}>
      <p className="sub">{monthLabel(month)}</p>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Monto para el mes</span>
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
          suggestions={getSuggestions(state, month, categoryId)}
          onPick={(value) => setAmount(toInputValue(value))}
        />
        <button className="btn full mt" type="submit">
          Guardar presupuesto
        </button>
      </form>
    </SheetContent>
  )
}
