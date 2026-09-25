import type { CSSProperties } from 'react'

type CustomProperties = Record<`--${string}`, string | number>

/** Typed helper to pass CSS custom properties through the `style` prop. */
export const cssVars = (vars: CustomProperties, style?: CSSProperties) =>
  ({ ...style, ...vars }) as CSSProperties

/** Joins truthy class names. */
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')
