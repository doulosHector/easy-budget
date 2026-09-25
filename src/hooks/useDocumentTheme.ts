import { useEffect } from 'react'
import type { ThemePreference } from '../types'

/** Reflects the theme preference on <html data-theme>, used by the tokens. */
export function useDocumentTheme(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
  }, [theme])
}
