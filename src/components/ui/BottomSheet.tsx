import { useEffect, type ReactNode } from 'react'
import { cx } from '../../utils/style'
import { Icon } from './Icon'
import './BottomSheet.css'

const TITLE_ID = 'sheet-title'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Modal panel that slides up from the bottom. It stays mounted while closed
 * so the exit transition can play; it is `inert` in that state.
 */
export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      <div className={cx('backdrop', open && 'open')} onClick={onClose} />
      <div
        className={cx('sheet', open && 'open')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        inert={!open}
      >
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  )
}

interface SheetContentProps {
  title: ReactNode
  onClose: () => void
  children: ReactNode
}

/** Header (title + close button) and scrollable body of a bottom sheet. */
export function SheetContent({ title, onClose, children }: SheetContentProps) {
  return (
    <>
      <div className="sheet-head">
        <h2 id={TITLE_ID}>{title}</h2>
        <button className="sheet-close" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" size={16} strokeWidth={2.2} />
        </button>
      </div>
      <div className="sheet-body">{children}</div>
    </>
  )
}
