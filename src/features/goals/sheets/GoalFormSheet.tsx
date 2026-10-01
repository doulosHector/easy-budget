import { useState, type FormEvent } from 'react'
import { AppearanceFields } from '../../../components/AppearanceFields'
import {
  CategoryIcon,
  ConfirmButton,
  SheetContent,
} from '../../../components/ui'
import {
  DEFAULT_GOAL_ICON,
  type CategoryIconName,
} from '../../../constants/icons'
import { paletteColor } from '../../../constants/palette'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { findGoal } from '../../../services/goals'
import { isMonthKey, monthLabel } from '../../../utils/date'
import { pluralize } from '../../../utils/format'
import { parseAmount, toInputValue } from '../../../utils/number'
import '../goals.css'

/** Creates a goal (`goalId` null) or edits/deletes an existing one. */
export function GoalFormSheet({ goalId }: { goalId: string | null }) {
  const { state, actions } = useBudget()
  const { month, closeSheet } = useUi()
  const { showToast } = useToast()
  const existing = goalId ? findGoal(state.goals, goalId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [target, setTarget] = useState(
    existing?.target != null ? toInputValue(existing.target) : '',
  )
  const [deadline, setDeadline] = useState(existing?.deadline ?? '')
  const [icon, setIcon] = useState<CategoryIconName>(
    existing?.icon ?? DEFAULT_GOAL_ICON,
  )
  const [color, setColor] = useState(
    existing?.color ?? paletteColor(state.goals.length),
  )
  const [plan, setPlan] = useState('')

  if (goalId && !existing) return null

  const movementCount = existing
    ? state.contributions.filter((c) => c.goalId === existing.id).length
    : 0
  const movementsText = `${movementCount} ${pluralize(movementCount, 'movimiento')}`

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Escribe un nombre')
      return
    }
    if (deadline && !isMonthKey(deadline)) {
      showToast('Escribe la fecha límite como AAAA-MM')
      return
    }
    const targetAmount = parseAmount(target)
    const changes = {
      name: trimmed,
      target: targetAmount > 0 ? targetAmount : null,
      deadline: deadline || null,
      icon,
      color,
    }
    if (existing) {
      actions.updateGoal(existing.id, changes)
    } else {
      actions.addGoal(changes, { month, amount: parseAmount(plan) })
    }
    closeSheet()
    showToast(existing ? 'Meta actualizada' : 'Meta creada')
  }

  const handleDelete = () => {
    if (!existing) return
    actions.deleteGoal(existing.id)
    closeSheet()
    showToast('Meta eliminada')
  }

  return (
    <SheetContent
      title={existing ? 'Editar meta' : 'Nueva meta'}
      onClose={closeSheet}
    >
      <div className="preview">
        <CategoryIcon category={{ icon, color }} size={24} />
        <b>{name || 'Nombre de la meta'}</b>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre</span>
          <input
            className="input"
            placeholder="Ej. Viaje a la playa"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="grid2">
          <label className="field">
            <span>Objetivo</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="$0.00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Fecha límite</span>
            <input
              className="input"
              type="month"
              placeholder="AAAA-MM"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
        </div>
        <p className="hint goal-form-hint">
          Ambos son opcionales. Con los dos, te sugerimos cuánto apartar cada
          mes para llegar a tiempo.
        </p>
        <AppearanceFields
          icon={icon}
          color={color}
          onIconChange={setIcon}
          onColorChange={setColor}
        />
        {!existing && (
          <label className="field">
            <span>Plan para {monthLabel(month).toLowerCase()} (opcional)</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="$0.00"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            />
          </label>
        )}
        <button className="btn full" type="submit">
          {existing ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </form>
      {existing && (
        <ConfirmButton
          className="btn danger full mt"
          confirmLabel="Toca otra vez para eliminar: no se puede deshacer"
          onConfirm={handleDelete}
        >
          Eliminar meta{movementCount > 0 && ` y sus ${movementsText}`}
        </ConfirmButton>
      )}
    </SheetContent>
  )
}
