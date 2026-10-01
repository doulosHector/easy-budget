# Easy Budget

A simple monthly budget app by category, built as an offline-first **PWA**.
Set how much money you have each month, split it across categories and
savings goals, and log expenses in a couple of taps. The UI is in Spanish (es-MX, MXN).

All data is stored **only on the device** (`localStorage`). There is no
backend and no account.

## Features

- **Budget**: money available per month, budget per category, progress
  bars, overspend warnings and suggestions (last month, 3-month average,
  last month's remainder).
- **Savings goals**: goals with an optional target and deadline,
  contributions and withdrawals, a monthly plan per goal with suggestions
  (last month's plan, and the amount that reaches the target on time).
  Saving uses the month's money without counting as spending; a withdrawal
  adds to what is available.
- **Expenses**: quick entry from each category, search by concept, filter
  by category and date range, edit and delete.
- **Statistics**: month summary vs. previous month, spending by category,
  daily chart, top concepts, 12-month average per category and savings.
- **Settings**: light/dark/system theme, CSV export/import (expenses,
  budgets and goals) and data reset. Deleting asks for a second tap.
- **PWA**: installable, works offline, updates automatically.

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript (strict)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox service worker + web manifest)
- [Vitest](https://vitest.dev) for unit tests
- [oxlint](https://oxc.rs) for linting and [Prettier](https://prettier.io) for formatting

## Getting started

Requires Node.js 22+ (see `.nvmrc`).

```bash
npm install
npm run dev
```

### Scripts

| Script                        | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `npm run dev`                 | Start the dev server                                 |
| `npm run build`               | Type-check and build for production into `dist/`     |
| `npm run preview`             | Serve the production build locally                   |
| `npm test`                    | Run unit tests (`npm run test:watch` for watch mode) |
| `npm run lint`                | Lint with oxlint                                     |
| `npm run typecheck`           | Type-check without building                          |
| `npm run format`              | Format all files with Prettier                       |
| `npm run generate-pwa-assets` | Regenerate the PWA icons from `public/favicon.svg`   |

## Project structure

```text
src/
├── app/            # App shell: providers, layout composition, sheet outlet
├── components/
│   ├── layout/     # Header, month navigation, bottom tab bar
│   └── ui/         # Reusable UI: icons, bottom sheet, toast, progress bar…
├── constants/      # Icons, color palette, locale, theme colors
├── context/        # React contexts: budget store, UI state, toasts
├── features/       # One folder per screen, with its components and sheets
│   ├── budget/
│   ├── expenses/
│   ├── goals/      # Savings goals section and sheets (on the budget screen)
│   ├── settings/
│   └── stats/
├── hooks/          # Shared hooks
├── services/       # Pure business logic: budget, goals, balance, stats, backup, storage
├── styles/         # Design tokens and global styles
├── test/           # Test factories
├── types/          # Domain and UI types
└── utils/          # Generic helpers: dates, money, CSV, ids…
```

- **State** lives in a reducer (`context/budget`) and is saved to
  `localStorage` on every change. Stored data is validated when loaded, and
  data saved by older versions (without goals) is migrated automatically.
- **Business logic** is kept in pure functions under `services/` so it is
  easy to test; components only render and dispatch actions.
- **Styles** use CSS custom properties for theming; each component or
  feature imports its own stylesheet.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` lints, tests, builds and
deploys the app on every push to `main`.

1. Create a GitHub repository and push this project to `main`.
2. In the repository, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

The app will be available at `https://<user>.github.io/<repo>/`. The base
path is detected automatically in CI; to build for a sub-path locally, set
`BASE_PATH`:

```bash
BASE_PATH=/easy-budget/ npm run build
```

## Moving data from the single-file version

Data from the original `Easy Budget.html` lives in that page's browser
storage. To move it, use **Ajustes → Exportar** in the old version and
**Ajustes → Importar CSV** here (import the expenses and the budgets files).

The budgets CSV now has the columns `mes, disponible, tipo, nombre,
presupuesto` (`tipo` is `categoria` or `meta`). Files in the old format
(`mes, disponible, categoria, presupuesto`) still import.
