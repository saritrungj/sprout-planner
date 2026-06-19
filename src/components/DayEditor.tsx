import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { AppState, getDayTaskIds, getDayLog, setTaskDone, addTask, addAddonTask } from '../lib/store'
import { formatDayLabel, todayISO } from '../lib/dates'
import { getDayStatus } from '../lib/status'

type Props = {
  date: string
  state: AppState
  setState: (s: AppState) => void
  onClose: () => void
}

export default function DayEditor({ date, state, setState, onClose }: Props) {
  const taskIds = getDayTaskIds(state, date)
  const log = getDayLog(state, date)
  const status = getDayStatus(state, date)
  const today = todayISO()
  const isFuture = date > today
  const [newTask, setNewTask] = useState('')

  function toggle(taskId: string) {
    setState(setTaskDone(state, date, taskId, !log.done[taskId]))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    const [s2, id] = addTask(state, newTask.trim())
    setState(addAddonTask(s2, date, id))
    setNewTask('')
  }

  const stampColor = {
    complete: 'bg-sprout-500 text-white',
    'in-progress': 'bg-amber-400 text-white',
    missed: 'bg-red-500 text-white',
    neutral: 'bg-gray-100 dark:bg-gray-800 text-gray-400',
  }[status]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {isFuture ? 'Planning ahead' : date < today ? 'Past day' : 'Today'}
            </p>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatDayLabel(date)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${stampColor}`}>
              {status === 'complete' ? '🌱 Done' : status === 'in-progress' ? '⏳ In progress' : status === 'missed' ? '❌ Missed' : '—'}
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex flex-col gap-2">
          {taskIds.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No tasks for this day.</p>
          )}
          {taskIds.map(id => {
            const task = state.tasks[id]
            if (!task) return null
            const isDone = !!log.done[id]
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                  ${isDone
                    ? 'bg-sprout-50 dark:bg-sprout-950 border-sprout-200 dark:border-sprout-800'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-sprout-200'
                  }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${isDone ? 'bg-sprout-500 border-sprout-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {isDone && <Check size={12} className="text-white" />}
                </div>
                <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  {task.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Add task */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a task for this day…"
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-sprout-400"
          />
          <button type="submit" className="px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white rounded-xl transition-colors">
            <Plus size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
