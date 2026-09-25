import { useRef, type ChangeEvent } from 'react'
import { useBudget } from '../../../context/budget'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import {
  BUDGETS_FILENAME,
  EXPENSES_FILENAME,
  exportBudgetsCsv,
  exportExpensesCsv,
  importCsv,
  type ImportResult,
} from '../../../services/backup'
import { downloadTextFile } from '../../../utils/download'
import { SettingRow } from './SettingRow'

const importMessage = (result: ImportResult): string => {
  switch (result.kind) {
    case 'expenses':
      return `${result.added} gastos importados${
        result.skipped ? `, ${result.skipped} omitidos` : ''
      }`
    case 'budgets':
      return `${result.rows} filas de presupuesto importadas`
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
        description="Disponible y presupuesto por categoría de cada mes"
      >
        <button
          className="btn ghost sm"
          onClick={() => exportFile(BUDGETS_FILENAME, exportBudgetsCsv(state))}
        >
          Exportar
        </button>
      </SettingRow>
      <SettingRow
        title="Importar CSV"
        description="Acepta archivos de gastos o de presupuestos exportados desde aquí"
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
