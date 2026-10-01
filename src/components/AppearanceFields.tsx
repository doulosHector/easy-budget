import {
  CATEGORY_ICON_NAMES,
  CATEGORY_ICONS,
  type CategoryIconName,
} from '../constants/icons'
import { PALETTE } from '../constants/palette'
import { cssVars, cx } from '../utils/style'
import { SvgIcon } from './ui'
import './AppearanceFields.css'

interface AppearanceFieldsProps {
  icon: CategoryIconName
  color: string
  onIconChange: (icon: CategoryIconName) => void
  onColorChange: (color: string) => void
}

/** Icon and color pickers shared by the category and goal forms. */
export function AppearanceFields({
  icon,
  color,
  onIconChange,
  onColorChange,
}: AppearanceFieldsProps) {
  return (
    <>
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
              onClick={() => onIconChange(key)}
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
              onClick={() => onColorChange(swatch)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
