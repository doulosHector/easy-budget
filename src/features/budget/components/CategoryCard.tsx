import { CategoryIcon, ProgressBar } from '../../../components/ui'
import type { Category } from '../../../types'
import { formatMoney } from '../../../utils/format'
import { cx } from '../../../utils/style'

interface CategoryCardProps {
  category: Category
  budget: number
  spent: number
  onSelect: () => void
}

export function CategoryCard({
  category,
  budget,
  spent,
  onSelect,
}: CategoryCardProps) {
  const hasBudget = budget > 0
  const left = budget - spent
  const percent = hasBudget ? (spent / budget) * 100 : 0
  const over = hasBudget && spent > budget

  let amount = formatMoney(spent)
  if (hasBudget) amount = over ? `-${formatMoney(-left)}` : formatMoney(left)

  let detail = spent > 0 ? 'Gastado, sin presupuesto' : 'Sin presupuesto'
  if (hasBudget) detail = `${formatMoney(spent)} de ${formatMoney(budget)}`

  return (
    <button className="cat" onClick={onSelect}>
      <CategoryIcon category={category} />
      <span className="cat-body">
        <span className="cat-top">
          <span className="cat-name">{category.name}</span>
          <span className={cx('cat-left', over && 'over')}>{amount}</span>
        </span>
        <ProgressBar small value={percent} over={over} color={category.color} />
        <span className="cat-sub">
          <span>{detail}</span>
          <span>{hasBudget ? `${Math.round(percent)}%` : ''}</span>
        </span>
      </span>
    </button>
  )
}
