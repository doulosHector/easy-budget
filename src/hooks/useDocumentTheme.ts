import { useEffect } from 'react'
import { THEME_COLORS } from '../constants/theme'
import type { ThemePreference } from '../types'

/**
 * Reflects the theme preference on <html data-theme> (used by the design
 * tokens) and on the `theme-color` metas that tint the browser/status bar.
 */
export function useDocumentTheme(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        const scheme = meta.media.includes('dark') ? 'dark' : 'light'
        meta.content = THEME_COLORS[theme === 'system' ? scheme : theme]
      })
  }, [theme])
}
