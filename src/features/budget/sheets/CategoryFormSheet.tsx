import { useState, type FormEvent } from 'react'
import { CategoryIcon, SheetContent, SvgIcon } from '../../../components/ui'
import {
  CATEGORY_ICON_NAMES,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
  type CategoryIconName,
} from '../../../constants/icons'
import { PALETTE, paletteColor } from '../../../constants/palette'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { findCategory } from '../../../services/budget'
import { monthLabel } from '../../../utils/date'
import { pluralize } from '../../../utils/format'
import { parseAmount } from '../../../utils/number'
import { cssVars, cx } from '../../../utils/style'
import '../budget.css'

/** Creates a category (`categoryId` null) or edits/deletes an existing one. */
export function CategoryFormSheet({
  categoryId,
}: {
  categoryId: string | null
}) {
  const { state, actions } = useBudget()
  const { month, closeSheet } = useUi()
  const { showToast } = useToast()
  const existing = categoryId
    ? findCategory(state.categories, categoryId)
    : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [icon, setIcon] = useState<CategoryIconName>(
    existing?.icon ?? DEFAULT_CATEGORY_ICON,
  )
  const [color, setColor] = useState(
    existing?.color ?? paletteColor(state.categories.length),
  )
  const [budget, setBudget] = useState('')

  if (categoryId && !existing) return null

  const expenseCount = existing
    ? state.expenses.filter((e) => e.categoryId === existing.id).length
    : 0
  const expensesText = `${expenseCount} ${pluralize(expenseCount, 'gasto')}`

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Escribe un nombre')
      return
    }
    if (existing) {
      actions.updateCategory(existing.id, { name: trimmed, icon, color })
    } else {
      actions.addCategory(
        { name: trimmed, icon, color },
        { month, amount: parseAmount(budget) },
      )
    }
    closeSheet()
    showToast(existing ? 'Categoría actualizada' : 'Categoría creada')
  }

  const handleDelete = () => {
    if (!existing) return
    const message = `¿Eliminar "${existing.name}"${
      expenseCount ? ` y sus ${expensesText}` : ''
    }? Esta acción no se puede deshacer.`
    if (!window.confirm(message)) return
    actions.deleteCategory(existing.id)
    closeSheet()
    showToast('Categoría eliminada')
  }

  return (
    <SheetContent
      title={existing ? 'Editar categoría' : 'Nueva categoría'}
      onClose={closeSheet}
    >
      <div className="preview">
        <CategoryIcon category={{ icon, color }} size={24} />
        <b>{name || 'Nombre de la categoría'}</b>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Nombre</span>
          <input
            className="input"
            placeholder="Ej. Comida"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="field" role="group" aria-label="Icono">
          <span>Icono</span>
          <div className="icongrid">
            {CATEGORY_ICON_NAMES.map((key) => (
              <button
                key={key}
                type="button"
                className={cx(key === icon && 'on')}
                aria-label={key}
                aria-pressed={key === icon}
                onClick={() => setIcon(key)}
              >
                <SvgIcon>{CATEGORY_ICONS[key]}</SvgIcon>
              </button>
            ))}
          </div>
        </div>
        <div className="field" role="group" aria-label="Color">
          <span>Color</span>
          <div className="colorgrid">
            {PALETTE.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={cx(swatch === color && 'on')}
                style={cssVars({ '--c': swatch })}
                aria-label={swatch}
                aria-pressed={swatch === color}
                onClick={() => setColor(swatch)}
              />
            ))}
          </div>
        </div>
        {!existing && (
          <label className="field">
            <span>
              Presupuesto para {monthLabel(month).toLowerCase()} (opcional)
            </span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="$0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
        )}
        <button className="btn full" type="submit">
          {existing ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </form>
      {existing && (
        <button className="btn danger full mt" onClick={handleDelete}>
          Eliminar categoría{expenseCount > 0 && ` y sus ${expensesText}`}
        </button>
      )}
    </SheetContent>
  )
}
