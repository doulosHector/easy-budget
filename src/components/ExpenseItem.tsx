import { FALLBACK_COLOR } from '../constants/palette'
import type { Category, Expense } from '../types'
import { dayLabel } from '../utils/date'
import { formatMoney } from '../utils/format'
import { CategoryIcon } from './ui'

const UNKNOWN_CATEGORY: Pick<Category, 'name' | 'icon' | 'color'> = {
  name: 'Sin categoría',
  icon: 'tag',
  color: FALLBACK_COLOR,
}

interface ExpenseItemProps {
  expense: Expense
  category: Category | undefined
  onSelect: (expenseId: string) => void
}

export function ExpenseItem({ expense, category, onSelect }: ExpenseItemProps) {
  const cat = category ?? UNKNOWN_CATEGORY
  return (
    <button className="item" onClick={() => onSelect(expense.id)}>
      <CategoryIcon category={cat} size={18} />
      <span className="item-body">
        <span className="item-title">{expense.concept}</span>
        <span className="item-sub">
          {cat.name} · {dayLabel(expense.date)}
        </span>
      </span>
      <span className="item-amt">{formatMoney(expense.amount)}</span>
    </button>
  )
}
