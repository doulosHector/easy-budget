import { useContext } from 'react'
import { UiContext, type UiContextValue } from './UiContext'

export function useUi(): UiContextValue {
  const context = useContext(UiContext)
  if (!context) throw new Error('useUi must be used within UiProvider')
  return context
}
