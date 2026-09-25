import { useContext } from 'react'
import { BudgetContext, type BudgetContextValue } from './BudgetContext'

export function useBudget(): BudgetContextValue {
  const context = useContext(BudgetContext)
  if (!context) throw new Error('useBudget must be used within BudgetProvider')
  return context
}
