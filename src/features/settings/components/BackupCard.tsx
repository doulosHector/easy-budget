import { useRef, type ChangeEvent } from 'react'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import {
  BUDGETS_FILENAME,
  EXPENSES_FILENAME,
  GOALS_FILENAME,
  exportBudgetsCsv,
  exportExpensesCsv,
  exportGoalsCsv,
  importCsv,
  type ImportResult,
} from '../../../services/backup'
import { downloadTextFile } from '../../../utils/download'
import { pluralize } from '../../../utils/format'
import { SettingRow } from './SettingRow'

const importMessage = (result: ImportResult): string => {
  switch (result.kind) {
    case 'expenses':
      return `${result.added} gastos importados${
        result.skipped ? `, ${result.skipped} omitidos` : ''
      }`
    case 'budgets':
      return `${result.rows} filas de presupuesto importadas`
    case 'goals': {
      const parts = [
        `${result.added} ${pluralize(result.added, 'movimiento importado', 'movimientos importados')}`,
      ]
      if (result.goals) {
        parts.push(
          `${result.goals} ${pluralize(result.goals, 'meta nueva', 'metas nuevas')}`,
        )
      }
      if (result.skipped) parts.push(`${result.skipped} omitidos`)
      return parts.join(', ')
    }
    case 'empty':
      return 'El archivo está vacío'
    case 'unknown':
      return 'Formato no reconocido: usa un CSV exportado desde Easy Budget'
  }
}

export function BackupCard() {
  const { state, actions } = useBudget()
  const { openSheet } = useUi()
  const { showToast } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)

  const exportFile = (filename: string, data: string) => {
    if (downloadTextFile(filename, data)) showToast('Archivo descargado')
    else openSheet({ type: 'csvFallback', filename, data })
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    try {
      const imported = importCsv(state, await file.text())
      if (imported.state !== state) actions.replaceState(imported.state)
      showToast(importMessage(imported.result))
    } catch {
      showToast('No se pudo leer el archivo')
    }
  }

  return (
    <div className="card">
      <h3>Respaldo</h3>
      <SettingRow
        title="Exportar gastos"
        description="Todos los gastos en un archivo CSV"
      >
        <button
          className="btn ghost sm"
          onClick={() =>
            exportFile(EXPENSES_FILENAME, exportExpensesCsv(state))
          }
        >
          Exportar
        </button>
      </SettingRow>
      <SettingRow
        title="Exportar presupuestos"
        description="Disponible, presupuesto por categoría y plan por meta de cada mes"
      >
        <button
          className="btn ghost sm"
          onClick={() => exportFile(BUDGETS_FILENAME, exportBudgetsCsv(state))}
        >
          Exportar
        </button>
      </SettingRow>
      <SettingRow
        title="Exportar metas"
        description="Metas con todas sus aportaciones y retiros"
      >
        <button
          className="btn ghost sm"
          onClick={() => exportFile(GOALS_FILENAME, exportGoalsCsv(state))}
        >
          Exportar
        </button>
      </SettingRow>
      <SettingRow
        title="Importar CSV"
        description="Acepta archivos de gastos, presupuestos o metas exportados desde aquí"
      >
        <button
          className="btn ghost sm"
          onClick={() => fileInput.current?.click()}
        >
          Importar
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={handleFile}
        />
      </SettingRow>
    </div>
  )
}
