import type {
  BudgetSuggestions,
  SuggestionKind,
} from '../../../services/budget'
import { formatMoney } from '../../../utils/format'

const SUGGESTION_LABELS: Record<SuggestionKind, string> = {
  last: 'Mes pasado',
  avg: 'Prom. 3 meses',
  remaining: 'Restante',
}

const KINDS = Object.keys(SUGGESTION_LABELS) as SuggestionKind[]

interface SuggestionChipsProps {
  suggestions: BudgetSuggestions
  onPick: (amount: number) => void
}

export function SuggestionChips({ suggestions, onPick }: SuggestionChipsProps) {
  return (
    <div className="chips">
      {KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          className="chip sugg"
          onClick={() => onPick(suggestions[kind])}
        >
          {SUGGESTION_LABELS[kind]} <b>{formatMoney(suggestions[kind])}</b>
        </button>
      ))}
    </div>
  )
}
