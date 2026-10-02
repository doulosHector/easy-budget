import type { ReactNode } from 'react'

/** SVG paths (24×24 viewBox, stroke based) available for categories. */
export const CATEGORY_ICONS = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2 3h3l3 12h11l2-8H6" />
    </>
  ),
  car: (
    <>
      <path d="M3 12l2.5-5h13L21 12v5h-2M3 12v5h2" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
      <path d="M9 17h6M3 12h18" />
    </>
  ),
  food: (
    <>
      <path d="M5 3v18" />
      <path d="M3 3v5a2 2 0 004 0V3" />
      <ellipse cx="16.5" cy="7" rx="3" ry="4" />
      <path d="M16.5 11v10" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4z" />
      <path d="M16 9h2a2 2 0 010 4h-2" />
      <path d="M8 3v2M11 3v2" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M12 9v12M3 14h18" />
      <path d="M12 9c-1-3-4-4-5-2s2 2 5 2zm0 0c1-3 4-4 5-2s-2 2-5 2z" />
    </>
  ),
  book: (
    <>
      <path d="M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4z" />
      <path d="M20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6z" />
    </>
  ),
  shirt: <path d="M8 3l4 2 4-2 4 4-3 2v12H7V9L4 7z" />,
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  wifi: (
    <>
      <path d="M2 9a15 15 0 0120 0" />
      <path d="M5.5 12.5a10 10 0 0113 0" />
      <path d="M9 16a5 5 0 016 0" />
      <circle cx="12" cy="19.5" r=".8" />
    </>
  ),
  bag: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  gym: <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />,
  paw: (
    <>
      <circle cx="8" cy="7" r="1.5" />
      <circle cx="16" cy="7" r="1.5" />
      <circle cx="4.5" cy="11" r="1.5" />
      <circle cx="19.5" cy="11" r="1.5" />
      <path d="M12 11c-3 0-6 3-6 6 0 2 2 3 6 3s6-1 6-3c0-3-3-6-6-6z" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  tag: (
    <>
      <path d="M3 3h8l10 10-8 8L3 11z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  coins: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" />
    </>
  ),
  plane: (
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  ),
  school: (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type CategoryIconName = keyof typeof CATEGORY_ICONS

export const CATEGORY_ICON_NAMES = Object.keys(
  CATEGORY_ICONS,
) as CategoryIconName[]

export const DEFAULT_CATEGORY_ICON: CategoryIconName = 'tag'
export const DEFAULT_GOAL_ICON: CategoryIconName = 'target'

export const isCategoryIconName = (value: unknown): value is CategoryIconName =>
  typeof value === 'string' && Object.hasOwn(CATEGORY_ICONS, value)

/** SVG paths for the app chrome (navigation, actions, alerts). */
export const UI_ICONS = {
  budget: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 15h4" />
    </>
  ),
  expenses: (
    <>
      <path d="M4 4h16v16H4z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  stats: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
} satisfies Record<string, ReactNode>

export type UiIconName = keyof typeof UI_ICONS
