export const PALETTE = [
  '#3B82A0',
  '#2F8F6F',
  '#C4763B',
  '#A64D79',
  '#6D5BD0',
  '#D9A441',
  '#C94F4F',
  '#3F9F9A',
  '#7A8B3C',
  '#8A6A5A',
  '#4F6D9A',
  '#B85C8E',
] as const

/** Color used for expenses whose category no longer exists. */
export const FALLBACK_COLOR = '#888888'

/** Picks a palette color, cycling through it as categories are added. */
export const paletteColor = (index: number): string =>
  PALETTE[index % PALETTE.length]
