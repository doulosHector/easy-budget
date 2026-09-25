import { MonthNav } from './MonthNav'
import './AppHeader.css'

export function AppHeader() {
  return (
    <header className="top">
      <h1 className="brand">
        Easy <span>Budget</span>
      </h1>
      <MonthNav />
    </header>
  )
}
