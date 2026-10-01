import { formatMoney } from '../utils/format'

export interface SuggestionOption {
  key: string
  label: string
  amount: number
}

interface SuggestionChipsProps {
  options: readonly SuggestionOption[]
  onPick: (amount: number) => void
}

/** Chips that fill an amount input with a suggested value. */
export function SuggestionChips({ options, onPick }: SuggestionChipsProps) {
  return (
    <div className="chips">
      {options.map(({ key, label, amount }) => (
        <button
          key={key}
          type="button"
          className="chip sugg"
          onClick={() => onPick(amount)}
        >
          {label} <b>{formatMoney(amount)}</b>
        </button>
      ))}
    </div>
  )
}
