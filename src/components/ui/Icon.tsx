import type { ReactNode } from 'react'
import { UI_ICONS, type UiIconName } from '../../constants/icons'

interface SvgIconProps {
  children: ReactNode
  size?: number
  strokeWidth?: number
}

/** Stroke-based 24×24 icon. Decorative: hidden from assistive technology. */
export function SvgIcon({
  children,
  size = 20,
  strokeWidth = 1.75,
}: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

interface IconProps extends Omit<SvgIconProps, 'children'> {
  name: UiIconName
}

export function Icon({ name, ...props }: IconProps) {
  return <SvgIcon {...props}>{UI_ICONS[name]}</SvgIcon>
}
