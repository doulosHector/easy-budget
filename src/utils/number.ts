/** Parses user input into a finite number, ignoring thousands separators. */
export const parseAmount = (value: string | number): number => {
  const parsed = parseFloat(String(value).replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0)

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))
