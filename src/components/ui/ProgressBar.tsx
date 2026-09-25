import { clamp } from '../../utils/number'
import { cx } from '../../utils/style'

interface ProgressBarProps {
  /** Percentage, clamped to 0–100. */
  value: number
  over?: boolean
  small?: boolean
  /** Fill color; ignored when `over` is set. */
  color?: string
}

export function ProgressBar({ value, over, small, color }: ProgressBarProps) {
  return (
    <span className={cx('bar', small && 'sm')} aria-hidden="true">
      <span
        className={cx(over && 'over')}
        style={{
          width: `${clamp(value, 0, 100)}%`,
          background: over ? undefined : color,
        }}
      />
    </span>
  )
}
