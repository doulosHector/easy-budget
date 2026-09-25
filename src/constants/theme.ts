import type { ThemePreference } from '../types'

/** Browser UI (status bar) color for each resolved theme; matches `--bg`. */
export const THEME_COLORS: Record<
  Exclude<ThemePreference, 'system'>,
  string
> = {
  light: '#F4F4F1',
  dark: '#0F1113',
}
