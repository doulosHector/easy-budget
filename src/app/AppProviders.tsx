import { useCallback, type ReactNode } from 'react'
import { BudgetProvider } from '../context/budget'
import { ToastProvider, useToast } from '../context/toast'
import { UiProvider } from '../context/ui'

function PersistedBudgetProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const handleSaveError = useCallback(
    () => showToast('No se pudo guardar en este dispositivo'),
    [showToast],
  )
  return (
    <BudgetProvider onSaveError={handleSaveError}>{children}</BudgetProvider>
  )
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PersistedBudgetProvider>
        <UiProvider>{children}</UiProvider>
      </PersistedBudgetProvider>
    </ToastProvider>
  )
}
