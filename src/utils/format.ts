import { CURRENCY, LOCALE } from '../constants/locale'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
})

/** Formats an amount as currency, rounded to cents. */
export const formatMoney = (amount: number): string =>
  currencyFormatter.format(Math.round((amount || 0) * 100) / 100)

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

/** Returns `singular` or `plural` depending on `count`. */
export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
): string => (count === 1 ? singular : plural)
