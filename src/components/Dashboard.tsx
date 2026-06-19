import { useRef } from 'react'
import { Download } from 'lucide-react'
import { AppState } from '../lib/store'
import { currentMonth, buildMonthGrid, todayISO } from '../lib/dates'
import { getStreak, getMonthStats, getHeatmapData, getDayStatus } from '../lib/status'
import { exportDashboard, ExportRatio } from '../lib/export'
import Streak from './Streak'
import Heatmap from './Heatmap'
import StatCard from './StatCard'

type Props = { state: AppState }

export default function Dashboard({ state }: Props) {
  const exportRef = useRef<HTMLDivElement>(null)
  const month = currentMonth()
  const streak = getStreak(state)
  const stats = getMonthStats(state, month)
  const heatmap = getHeatmapData(state, 26)

  async function handleExport(ratio: ExportRatio) {
    if (!exportRef.current) return
    await exportDashboard(exportRef.current, ratio)
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">
      {/* Export buttons */}
      <div className="flex gap-2 justify-end" data-export-hide>
        <button
          onClick={() => handleExport('9:16')}
          className="flex items-center gap-2 px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white text-xs rounded-xl transition-colors font-medium"
        >
          <Download size={14} /> Export 9:16
        </button>
        <button
          onClick={() => handleExport('16:9')}
          className="flex items-center gap-2 px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white text-xs rounded-xl transition-colors font-medium"
        >
          <Download size={14} /> Export 16:9
        </button>
      </div>

      {/* Exportable content */}
      <div ref={exportRef} className="flex flex-col gap-4">
        <Streak streak={streak} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="This month" value={`${stats.completionPct}%`} sub="completion" />
          <StatCard label="Green days" value={stats.greenDays} sub={`of ${stats.totalDays} tracked`} color="text-sprout-600 dark:text-sprout-400" />
          <StatCard label="Tasks done" value={stats.tasksCompleted} color="text-blue-500" />
          <StatCard label="Best streak" value={`${streak.best}d`} color="text-orange-500" />
        </div>

        <Heatmap cells={heatmap} />

        <MiniMonthSummary state={state} month={month} />
      </div>
    </div>
  )
}

function MiniMonthSummary({ state, month }: { state: AppState; month: string }) {
  const today = todayISO()
  const grid = buildMonthGrid(month)
  const stats = getMonthStats(state, month)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-sprout-50 dark:border-sprout-950">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">This month</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{stats.greenDays}/{stats.totalDays} complete</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-300 dark:text-gray-600 pb-1">{d}</div>
        ))}
        {grid.flat().map((date, i) => {
          if (!date) return <div key={i} />
          const status = getDayStatus(state, date)
          const dayNum = parseInt(date.slice(8))
          const isToday = date === today
          return (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-colors
                ${status === 'complete'     ? 'bg-sprout-500 text-white' :
                  status === 'missed'       ? 'bg-red-100 dark:bg-red-950 text-red-500' :
                  status === 'in-progress'  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
                  isToday                   ? 'bg-sprout-50 dark:bg-sprout-950 text-sprout-600 font-bold' :
                                              'text-gray-300 dark:text-gray-600'
                }`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>
    </div>
  )
}
