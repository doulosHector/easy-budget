import { CATEGORY_ICONS } from '../../constants/icons'
import type { Category } from '../../types'
import { cssVars } from '../../utils/style'
import { SvgIcon } from './Icon'

interface CategoryIconProps {
  category: Pick<Category, 'icon' | 'color'>
  size?: number
}

export function CategoryIcon({ category, size = 20 }: CategoryIconProps) {
  return (
    <span className="cat-icon" style={cssVars({ '--c': category.color })}>
      <SvgIcon size={size}>
        {CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS.tag}
      </SvgIcon>
    </span>
  )
}
