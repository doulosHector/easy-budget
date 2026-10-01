import type { SuggestionOption } from '../../components/SuggestionChips'
import type { BudgetSuggestions, SuggestionKind } from '../../services/budget'

const SUGGESTION_LABELS: Record<SuggestionKind, string> = {
  last: 'Mes pasado',
  avg: 'Prom. 3 meses',
  remaining: 'Restante',
}

const KINDS = Object.keys(SUGGESTION_LABELS) as SuggestionKind[]

/** Chip options for a category budget. */
export const categorySuggestionOptions = (
  suggestions: BudgetSuggestions,
): SuggestionOption[] =>
  KINDS.map((kind) => ({
    key: kind,
    label: SUGGESTION_LABELS[kind],
    amount: suggestions[kind],
  }))
