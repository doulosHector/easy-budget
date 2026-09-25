import { BottomSheet } from '../components/ui'
import { useUi } from '../context/ui'
import {
  CategoryBudgetSheet,
  CategoryFormSheet,
  CategorySheet,
  MonthSetupSheet,
} from '../features/budget'
import { ExpenseSheet } from '../features/expenses'
import { CsvFallbackSheet } from '../features/settings'
import type { SheetState } from '../types'

function SheetBody({ sheet }: { sheet: SheetState }) {
  switch (sheet.type) {
    case 'category':
      return <CategorySheet categoryId={sheet.categoryId} />
    case 'categoryBudget':
      return <CategoryBudgetSheet categoryId={sheet.categoryId} />
    case 'categoryForm':
      return <CategoryFormSheet categoryId={sheet.categoryId} />
    case 'monthSetup':
      return <MonthSetupSheet />
    case 'expense':
      return <ExpenseSheet expenseId={sheet.expenseId} />
    case 'csvFallback':
      return <CsvFallbackSheet filename={sheet.filename} data={sheet.data} />
  }
}

/** Renders the active sheet inside the single, app-wide bottom sheet. */
export function SheetOutlet() {
  const { sheet, isSheetOpen, closeSheet } = useUi()
  return (
    <BottomSheet open={isSheetOpen} onClose={closeSheet}>
      {sheet && <SheetBody key={sheet.key} sheet={sheet.state} />}
    </BottomSheet>
  )
}
