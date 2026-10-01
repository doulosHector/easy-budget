import type { SuggestionOption } from '../../components/SuggestionChips'
import type { GoalSuggestions } from '../../services/goals'

/** Chip options for a goal plan; "A tiempo" needs a target and a deadline. */
export const goalSuggestionOptions = ({
  last,
  onTime,
}: GoalSuggestions): SuggestionOption[] => [
  { key: 'last', label: 'Mes pasado', amount: last },
  ...(onTime == null
    ? []
    : [{ key: 'onTime', label: 'A tiempo', amount: onTime }]),
]
