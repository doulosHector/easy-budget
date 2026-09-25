import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { loadState, saveState } from '../../services/storage'
import { BudgetContext, createBudgetActions } from './BudgetContext'
import { budgetReducer } from './budgetReducer'

interface BudgetProviderProps {
  children: ReactNode
  /** Called when the state could not be written to localStorage. */
  onSaveError?: () => void
}

export function BudgetProvider({ children, onSaveError }: BudgetProviderProps) {
  const [state, dispatch] = useReducer(budgetReducer, undefined, loadState)

  useEffect(() => {
    if (!saveState(state)) onSaveError?.()
  }, [state, onSaveError])

  const actions = useMemo(() => createBudgetActions(dispatch), [])
  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <BudgetContext value={value}>{children}</BudgetContext>
}
