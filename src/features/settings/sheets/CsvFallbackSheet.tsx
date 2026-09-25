import { useRef } from 'react'
import { SheetContent } from '../../../components/ui'
import { useToast } from '../../../context/toast'
import { useUi } from '../../../context/ui'
import { stripBom } from '../../../utils/csv'

interface CsvFallbackSheetProps {
  filename: string
  data: string
}

/** Shown when the browser could not download a file: lets the user copy it. */
export function CsvFallbackSheet({ filename, data }: CsvFallbackSheetProps) {
  const { closeSheet } = useUi()
  const { showToast } = useToast()
  const textarea = useRef<HTMLTextAreaElement>(null)
  const content = stripBom(data)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      showToast('Copiado')
    } catch {
      textarea.current?.select()
      showToast('Selecciona y copia el texto')
    }
  }

  return (
    <SheetContent title="Copiar CSV" onClose={closeSheet}>
      <p className="sub">
        Si la descarga no inició, copia el contenido y pégalo en un archivo
        llamado {filename}.
      </p>
      <textarea
        ref={textarea}
        className="input"
        readOnly
        value={content}
        aria-label={filename}
      />
      <button className="btn full mt" onClick={handleCopy}>
        Copiar al portapapeles
      </button>
    </SheetContent>
  )
}
