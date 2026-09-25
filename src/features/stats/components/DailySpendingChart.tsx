import { formatMoney } from '../../../utils/format'

const WIDTH = 340
const HEIGHT = 120
const PAD_X = 4
const PAD_BOTTOM = 18
const PAD_TOP = 8
const DAY_TICKS = [1, 8, 15, 22, 29]

interface DailySpendingChartProps {
  /** Spending per day (index 0 is day 1). */
  perDay: number[]
  dailyAverage: number
  /** Zero-based index of today, or -1 when today is not in the month. */
  todayIndex: number
}

export function DailySpendingChart({
  perDay,
  dailyAverage,
  todayIndex,
}: DailySpendingChartProps) {
  const days = perDay.length
  const max = Math.max(...perDay, 1)
  const plotHeight = HEIGHT - PAD_BOTTOM - PAD_TOP
  const baseline = HEIGHT - PAD_BOTTOM
  const barWidth = (WIDTH - PAD_X * 2) / days
  const averageY = baseline - (dailyAverage / max) * plotHeight

  return (
    <div className="card">
      <h3>
        Gasto por día<small>Línea punteada: promedio diario</small>
      </h3>
      <svg
        className="chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Gráfica de gasto por día del mes"
      >
        <line className="grid" x1="0" y1={baseline} x2={WIDTH} y2={baseline} />
        {dailyAverage > 0 && (
          <line
            className="avg"
            x1="0"
            y1={averageY.toFixed(1)}
            x2={WIDTH}
            y2={averageY.toFixed(1)}
          />
        )}
        {perDay.map((value, i) => {
          if (value <= 0) return null
          const height = Math.max(2, (value / max) * plotHeight)
          return (
            <rect
              key={i}
              className={i === todayIndex ? 'today' : undefined}
              x={(PAD_X + i * barWidth + 1).toFixed(1)}
              y={(baseline - height).toFixed(1)}
              width={Math.max(1, barWidth - 2).toFixed(1)}
              height={height.toFixed(1)}
              rx="1.5"
            >
              <title>{`${i + 1}: ${formatMoney(value)}`}</title>
            </rect>
          )
        })}
        {DAY_TICKS.filter((day) => day <= days).map((day) => (
          <text
            key={day}
            x={(PAD_X + (day - 1) * barWidth + barWidth / 2).toFixed(1)}
            y={HEIGHT - 4}
            textAnchor="middle"
          >
            {day}
          </text>
        ))}
      </svg>
    </div>
  )
}
