import { useEffect, type RefObject } from 'react'

/** Focuses an element after a delay (e.g. once a sheet finished sliding in). */
export function useDelayedFocus(
  ref: RefObject<HTMLElement | null>,
  delayMs = 320,
) {
  useEffect(() => {
    const timer = setTimeout(() => ref.current?.focus(), delayMs)
    return () => clearTimeout(timer)
  }, [ref, delayMs])
}
