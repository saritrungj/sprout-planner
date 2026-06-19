import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AppState, addTask, addMainTask, removeMainTask, getMonthPlan } from '../lib/store'
import { currentMonth } from '../lib/dates'

type Props = {
  state: AppState
  setState: (s: AppState) => void
}

export default function TaskManager({ state, setState }: Props) {
  const month = currentMonth()
  const plan = getMonthPlan(state, month)
  const [newTitle, setNewTitle] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const [s2, id] = addTask(state, newTitle.trim())
    setState(addMainTask(s2, month, id))
    setNewTitle('')
  }

  function handleRemove(taskId: string) {
    setState(removeMainTask(state, month, taskId))
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Monthly recurring tasks</h3>

      {plan.mainTaskIds.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">No recurring tasks this month.</p>
      )}

      {plan.mainTaskIds.map(id => {
        const task = state.tasks[id]
        if (!task) return null
        return (
          <div key={id} className="flex items-center gap-3 group">
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{task.title}</span>
            <button
              onClick={() => handleRemove(id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
              aria-label="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      })}

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New recurring task…"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-sprout-400"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  )
}
