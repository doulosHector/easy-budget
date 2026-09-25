import { useMemo } from 'react'
import { EmptyState } from '../../components/ui'
import { useBudget } from '../../context/budget'
import { useUi } from '../../context/ui'
import { filterExpenses } from '../../services/budget'
import { formatMoney, pluralize } from '../../utils/format'
import { sum } from '../../utils/number'
import { ExpenseFilters } from './components/ExpenseFilters'
import { ExpenseList } from './components/ExpenseList'
import './expenses.css'

export function ExpensesView() {
  const { state } = useBudget()
  const { filters } = useUi()
  const expenses = useMemo(
    () => filterExpenses(state.expenses, filters),
    [state.expenses, filters],
  )
  const hasAny = state.expenses.length > 0

  return (
    <>
      <ExpenseFilters />
      <p className="summary" aria-live="polite">
        {expenses.length > 0 && (
          <>
            <b>{expenses.length}</b> {pluralize(expenses.length, 'gasto')} ·
            Total <b>{formatMoney(sum(expenses.map((e) => e.amount)))}</b>
          </>
        )}
      </p>
      {expenses.length ? (
        <ExpenseList expenses={expenses} />
      ) : (
        <EmptyState
          title={hasAny ? 'Nada con estos filtros' : 'Aún no hay gastos'}
        >
          {hasAny
            ? 'Prueba con otra categoría, fecha o concepto.'
            : 'Toca una categoría en Presupuesto para registrar el primero.'}
        </EmptyState>
      )}
    </>
  )
}
