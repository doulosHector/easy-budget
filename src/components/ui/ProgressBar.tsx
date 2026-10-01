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

interface BarSegment {
  /** Percentage of the whole bar. */
  value: number
  className?: string
}

interface StackedBarProps {
  segments: readonly BarSegment[]
  over?: boolean
}

/** Clamps each value so that together they never pass 100. */
const fitWidths = (values: readonly number[]): number[] =>
  values.reduce<number[]>((widths, value) => {
    const used = widths.reduce((total, width) => total + width, 0)
    return [...widths, clamp(value, 0, 100 - used)]
  }, [])

/** Several fills side by side; together they never pass 100%. */
export function StackedBar({ segments, over }: StackedBarProps) {
  const widths = fitWidths(segments.map((segment) => segment.value))
  return (
    <span className="bar stacked" aria-hidden="true">
      {segments.map((segment, index) => (
        <span
          key={index}
          className={cx(over ? 'over' : segment.className)}
          style={{ width: `${widths[index]}%` }}
        />
      ))}
    </span>
  )
}
