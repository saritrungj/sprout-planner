import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AppState } from '../lib/store'
import { buildMonthGrid, currentMonth, prevMonth, nextMonth, formatMonthLabel, todayISO } from '../lib/dates'
import { getDayStatus, DayStatus } from '../lib/status'
import DayEditor from './DayEditor'

type Props = {
  state: AppState
  setState: (s: AppState) => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function DayStamp({ status, date, today }: { status: DayStatus; date: string; today: string }) {
  const isToday = date === today
  const base = 'w-full aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all'
  if (status === 'complete') return <div className={`${base} bg-sprout-500 text-white shadow-sm ${isToday ? 'ring-2 ring-sprout-300' : ''}`}>✓</div>
  if (status === 'missed')   return <div className={`${base} bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400 ${isToday ? 'ring-2 ring-red-300' : ''}`}>✕</div>
  if (status === 'in-progress') return <div className={`${base} bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 ring-2 ring-amber-300`}>…</div>
  return <div className={`${base} ${isToday ? 'ring-2 ring-sprout-300 dark:ring-sprout-600' : ''}`} />
}

export default function CalendarView({ state, setState }: Props) {
  const [month, setMonth] = useState(currentMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const today = todayISO()
  const grid = buildMonthGrid(month)

  return (
    <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth(prevMonth(month))} className="p-2 rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 text-gray-500 dark:text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatMonthLabel(month)}</h2>
        <button onClick={() => setMonth(nextMonth(month))} className="p-2 rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 text-gray-500 dark:text-gray-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />
              const status = getDayStatus(state, date)
              const dayNum = parseInt(date.slice(8))
              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 transition-colors group"
                >
                  <span className={`text-xs font-medium ${date === today ? 'text-sprout-600 dark:text-sprout-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {dayNum}
                  </span>
                  <DayStamp status={status} date={date} today={today} />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center pt-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sprout-500 inline-block" /> Complete</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950 inline-block" /> Missed</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950 inline-block" /> In progress</span>
      </div>

      {selected && (
        <DayEditor date={selected} state={state} setState={setState} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
