import { BackupCard } from './components/BackupCard'
import { DataCard } from './components/DataCard'
import { ThemeCard } from './components/ThemeCard'
import './settings.css'

export function SettingsView() {
  return (
    <>
      <ThemeCard />
      <BackupCard />
      <DataCard />
    </>
  )
}
