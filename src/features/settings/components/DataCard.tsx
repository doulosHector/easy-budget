import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { pluralize } from '../../../utils/format'
import { SettingRow } from './SettingRow'

export function DataCard() {
  const { state, actions } = useBudget()
  const { showToast } = useToast()
  const categories = state.categories.length
  const expenses = state.expenses.length

  const handleReset = () => {
    const confirmed = window.confirm(
      '¿Borrar todos los datos de Easy Budget en este dispositivo? No se puede deshacer.',
    )
    if (!confirmed) return
    actions.resetState()
    showToast('Datos borrados')
  }

  return (
    <div className="card">
      <h3>Datos</h3>
      <SettingRow
        title={`${categories} ${pluralize(categories, 'categoría')} · ${expenses} ${pluralize(expenses, 'gasto')}`}
        description="Todo se guarda solo en este dispositivo"
      />
      <SettingRow
        title="Borrar todo"
        description="Elimina categorías, presupuestos y gastos"
      >
        <button className="btn danger sm" onClick={handleReset}>
          Borrar
        </button>
      </SettingRow>
    </div>
  )
}
