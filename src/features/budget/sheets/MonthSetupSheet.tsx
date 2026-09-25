import { useMemo, useState, type FormEvent } from 'react'
import { CategoryIcon, SheetContent } from '../../../components/ui'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import {
  getCategoryBudget,
  getMonth,
  getSuggestions,
  type SuggestionKind,
} from '../../../services/budget'
import { monthLabel, shiftMonth } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'
import { parseAmount, sum, toInputValue } from '../../../utils/number'
import { SuggestionChips } from '../components/SuggestionChips'
import '../budget.css'

const APPLY_ALL: { kind: SuggestionKind; label: string }[] = [
  { kind: 'last', label: 'Igual que el mes pasado' },
  { kind: 'avg', label: 'Promedio 3 meses' },
  { kind: 'remaining', label: 'Restante del mes pasado' },
]

/** Configures the money available for a month and the budget per category. */
export function MonthSetupSheet() {
  const { state, actions } = useBudget()
  const { month, closeSheet } = useUi()
  const { showToast } = useToast()
  const { categories } = state
  const current = getMonth(state, month)
  const previous = getMonth(state, shiftMonth(month, -1))

  const [available, setAvailable] = useState(
    current.available != null ? toInputValue(current.available) : '',
  )
  const [budgets, setBudgets] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      categories.map((c) => {
        const budget = getCategoryBudget(state, month, c.id)
        return [c.id, budget ? toInputValue(budget) : '']
      }),
    ),
  )
  const suggestions = useMemo(
    () =>
      Object.fromEntries(
        categories.map((c) => [c.id, getSuggestions(state, month, c.id)]),
      ),
    [state, categories, month],
  )

  const availableAmount = parseAmount(available)
  const assigned = sum(Object.values(budgets).map(parseAmount))

  const setBudget = (categoryId: string, value: string) =>
    setBudgets((current) => ({ ...current, [categoryId]: value }))

  const applyToAll = (kind: SuggestionKind) =>
    setBudgets(
      Object.fromEntries(
        categories.map((c) => {
          const value = suggestions[c.id][kind]
          return [c.id, value ? toInputValue(value) : '']
        }),
      ),
    )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    actions.saveMonth(
      month,
      available.trim() === '' ? null : availableAmount,
      Object.fromEntries(
        Object.entries(budgets).map(([id, value]) => [id, parseAmount(value)]),
      ),
    )
    closeSheet()
    showToast('Mes configurado')
  }

  return (
    <SheetContent
      title={`Configurar ${monthLabel(month).toLowerCase()}`}
      onClose={closeSheet}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Dinero disponible este mes</span>
          <input
            className="input big"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="$0.00"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          />
        </label>
        {previous.available != null && (
          <div className="chips tight">
            <button
              type="button"
              className="chip sugg"
              onClick={() =>
                setAvailable(toInputValue(previous.available ?? 0))
              }
            >
              Mes pasado <b>{formatMoney(previous.available)}</b>
            </button>
          </div>
        )}

        <div className="sec-title">
          <h2>Presupuesto por categoría</h2>
        </div>
        <p className="hint apply-all-label">Aplicar a todas:</p>
        <div className="chips apply-all">
          {APPLY_ALL.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              className="chip"
              onClick={() => applyToAll(kind)}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          {categories.length ? (
            categories.map((category) => (
              <div className="mrow" key={category.id}>
                <div className="name">
                  <CategoryIcon category={category} size={16} />
                  <span>{category.name}</span>
                </div>
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-label={`Presupuesto de ${category.name}`}
                  value={budgets[category.id] ?? ''}
                  onChange={(e) => setBudget(category.id, e.target.value)}
                />
                <SuggestionChips
                  suggestions={suggestions[category.id]}
                  onPick={(value) =>
                    setBudget(category.id, toInputValue(value))
                  }
                />
              </div>
            ))
          ) : (
            <p className="hint">
              Aún no tienes categorías. Créalas desde Presupuesto.
            </p>
          )}
        </div>

        <p className="summary">
          Asignado <b>{formatMoney(assigned)}</b> de{' '}
          <b>{formatMoney(availableAmount)}</b>
          {assigned > availableAmount && availableAmount > 0 ? (
            <>
              {' · '}
              <span className="text-danger">
                te excedes por {formatMoney(assigned - availableAmount)}
              </span>
            </>
          ) : (
            availableAmount > 0 &&
            ` · quedan ${formatMoney(availableAmount - assigned)} sin asignar`
          )}
        </p>
        <button className="btn full mt" type="submit">
          Guardar mes
        </button>
      </form>
    </SheetContent>
  )
}
