import { useEffect, useState, type ReactNode } from 'react'
import { cx } from '../../utils/style'

/** Time the button waits for the second tap. */
const CONFIRM_WINDOW_MS = 3500

interface ConfirmButtonProps {
  className?: string
  /** Text shown after the first tap, asking for the second one. */
  confirmLabel?: ReactNode
  onConfirm: () => void
  children: ReactNode
}

/**
 * Destructive action that runs only after a second tap within 3.5 seconds.
 * Replaces `window.confirm()`, which sandboxed frames and some installed
 * PWAs block (it then returns `false` and the action silently does nothing).
 */
export function ConfirmButton({
  className,
  confirmLabel = 'Toca otra vez para confirmar',
  onConfirm,
  children,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [armed])

  const handleClick = () => {
    if (!armed) {
      setArmed(true)
      return
    }
    setArmed(false)
    onConfirm()
  }

  return (
    <button
      type="button"
      className={cx(className, armed && 'armed')}
      aria-live="polite"
      onClick={handleClick}
    >
      {armed ? confirmLabel : children}
    </button>
  )
}
