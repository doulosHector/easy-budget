import { ExpenseItem } from '../../../components/ExpenseItem'
import { useBudget } from '../../../context/budget'
import { useUi } from '../../../context/ui'
import { findCategory } from '../../../services/budget'
import type { DateKey, Expense } from '../../../types'
import { dayLabel } from '../../../utils/date'
import { formatMoney } from '../../../utils/format'

interface DayGroup {
  date: DateKey
  total: number
  expenses: Expense[]
}

/** Groups expenses (already sorted by date) into consecutive days. */
const groupByDay = (expenses: readonly Expense[]): DayGroup[] => {
  const groups: DayGroup[] = []
  for (const expense of expenses) {
    let group = groups.at(-1)
    if (group?.date !== expense.date) {
      group = { date: expense.date, total: 0, expenses: [] }
      groups.push(group)
    }
    group.total += expense.amount
    group.expenses.push(expense)
  }
  return groups
}

export function ExpenseList({ expenses }: { expenses: readonly Expense[] }) {
  const { state } = useBudget()
  const { openSheet } = useUi()
  const openExpense = (expenseId: string) =>
    openSheet({ type: 'expense', expenseId })

  return groupByDay(expenses).map((group) => (
    <section key={group.date}>
      <h3 className="day">
        <span>{dayLabel(group.date)}</span>
        <span>{formatMoney(group.total)}</span>
      </h3>
      <div className="list">
        {group.expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            category={findCategory(state.categories, expense.categoryId)}
            onSelect={openExpense}
          />
        ))}
      </div>
    </section>
  ))
}
