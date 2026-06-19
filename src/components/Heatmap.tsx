import { HeatmapCell } from '../lib/status'
import { todayISO } from '../lib/dates'

type Props = { cells: HeatmapCell[] }

function cellColor(cell: HeatmapCell): string {
  const today = todayISO()
  if (cell.date > today) return 'bg-gray-100 dark:bg-gray-800'
  if (cell.status === 'neutral') return 'bg-gray-100 dark:bg-gray-800'
  if (cell.status === 'missed') return 'bg-red-200 dark:bg-red-900'
  if (cell.ratio === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (cell.ratio < 0.34) return 'bg-sprout-200 dark:bg-sprout-900'
  if (cell.ratio < 0.67) return 'bg-sprout-400 dark:bg-sprout-700'
  if (cell.ratio < 1)   return 'bg-sprout-500 dark:bg-sprout-600'
  return 'bg-sprout-600 dark:bg-sprout-500'
}

export default function Heatmap({ cells }: Props) {
  // cells is a flat array of dates, Sunday-aligned, 26 weeks
  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  // Month labels: pick first cell of each month
  const monthLabels: { col: number; label: string }[] = []
  weeks.forEach((week, wi) => {
    const first = week.find(c => c.date.slice(8) === '01')
    if (first) {
      first.date.split('-')
      monthLabels.push({
        col: wi,
        label: new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }),
      })
    }
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-sprout-50 dark:border-sprout-950">
      <h3 className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium mb-3">Contribution heatmap</h3>

      {/* Month labels */}
      <div className="relative" style={{ paddingLeft: '28px' }}>
        <div className="flex gap-[3px] mb-1 text-xs text-gray-400 dark:text-gray-500" style={{ height: '14px' }}>
          {weeks.map((_week, wi) => {
            const ml = monthLabels.find(m => m.col === wi)
            return (
              <div key={wi} style={{ width: '12px', flexShrink: 0 }}>
                {ml && <span className="text-[10px]">{ml.label}</span>}
              </div>
            )
          })}
        </div>

        {/* Day-of-week labels + grid */}
        <div className="flex gap-1">
          <div className="flex flex-col gap-[3px] mr-1 text-[9px] text-gray-300 dark:text-gray-600" style={{ width: '20px' }}>
            {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
              <div key={i} style={{ height: '12px', lineHeight: '12px' }}>{d}</div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={`${cell.date}: ${Math.round(cell.ratio * 100)}%`}
                    className={`w-3 h-3 rounded-[2px] ${cellColor(cell)} transition-colors`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-gray-400 dark:text-gray-500">
        <span>Less</span>
        {['bg-gray-100 dark:bg-gray-800', 'bg-sprout-200 dark:bg-sprout-900', 'bg-sprout-400 dark:bg-sprout-700', 'bg-sprout-600 dark:bg-sprout-500'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
