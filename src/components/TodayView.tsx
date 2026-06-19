import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { AppState, getDayTaskIds, getDayLog, setTaskDone, addTask, addAddonTask } from '../lib/store'
import { todayISO, formatDayLabel } from '../lib/dates'
import { getDayStatus } from '../lib/status'
import TaskManager from './TaskManager'

type Props = {
  state: AppState
  setState: (s: AppState) => void
}

export default function TodayView({ state, setState }: Props) {
  const today = todayISO()
  const taskIds = getDayTaskIds(state, today)
  const log = getDayLog(state, today)
  const status = getDayStatus(state, today)
  const [newTask, setNewTask] = useState('')
  const [showManager, setShowManager] = useState(false)

  const done = taskIds.filter(id => log.done[id]).length
  const total = taskIds.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  function toggle(taskId: string) {
    setState(setTaskDone(state, today, taskId, !log.done[taskId]))
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    let s = state
    const [s2, id] = addTask(s, newTask.trim())
    s = addAddonTask(s2, today, id)
    setState(s)
    setNewTask('')
  }

  const statusColors = {
    complete: 'bg-sprout-500',
    'in-progress': 'bg-amber-400',
    missed: 'bg-red-500',
    neutral: 'bg-gray-200 dark:bg-gray-700',
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{formatDayLabel(today)}</p>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Today</h1>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all ${statusColors[status]}`}>
          {status === 'complete' ? '🌱' : `${pct}%`}
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${status === 'complete' ? 'bg-sprout-500' : status === 'in-progress' ? 'bg-amber-400' : 'bg-gray-300'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {taskIds.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-2">🌱</p>
            <p className="text-sm">No tasks yet. Plant your first task below!</p>
          </div>
        )}
        {taskIds.map(id => {
          const task = state.tasks[id]
          if (!task) return null
          const isDone = !!log.done[id]
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all
                ${isDone
                  ? 'bg-sprout-50 dark:bg-sprout-950 border-sprout-200 dark:border-sprout-800'
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-sprout-200'
                }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${isDone ? 'bg-sprout-500 border-sprout-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {isDone && <Check size={14} className="text-white" />}
              </div>
              <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                {task.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add today task */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a task for today…"
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-sprout-400 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-sprout-600 hover:bg-sprout-700 text-white rounded-2xl transition-colors"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Manage monthly tasks */}
      <button
        onClick={() => setShowManager(v => !v)}
        className="text-sm text-sprout-600 dark:text-sprout-400 hover:underline text-center"
      >
        {showManager ? 'Hide' : 'Manage'} monthly recurring tasks
      </button>

      {showManager && (
        <TaskManager state={state} setState={setState} />
      )}
    </div>
  )
}
