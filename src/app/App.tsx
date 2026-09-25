import type { ComponentType } from 'react'
import { AppHeader, BottomNav } from '../components/layout'
import { useBudget } from '../context/budget'
import { useUi } from '../context/ui'
import { BudgetView } from '../features/budget'
import { ExpensesView } from '../features/expenses'
import { SettingsView } from '../features/settings'
import { StatsView } from '../features/stats'
import { useDocumentTheme } from '../hooks/useDocumentTheme'
import type { View } from '../types'
import { AppProviders } from './AppProviders'
import { SheetOutlet } from './SheetOutlet'

const VIEWS: Record<View, ComponentType> = {
  budget: BudgetView,
  expenses: ExpensesView,
  stats: StatsView,
  settings: SettingsView,
}

function AppShell() {
  const { state } = useBudget()
  const { view } = useUi()
  useDocumentTheme(state.settings.theme)
  const ActiveView = VIEWS[view]

  return (
    <>
      <div className="app">
        <AppHeader />
        <main>
          <ActiveView />
        </main>
      </div>
      <BottomNav />
      <SheetOutlet />
    </>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}
