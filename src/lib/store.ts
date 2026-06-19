export type Task = {
  id: string
  title: string
  createdAt: string
}

export type MonthPlan = {
  month: string        // "2026-06"
  mainTaskIds: string[]
}

export type DayLog = {
  date: string         // "2026-06-19"
  done: Record<string, boolean>
  addonTaskIds: string[]
}

export type AppState = {
  tasks: Record<string, Task>
  months: Record<string, MonthPlan>
  days: Record<string, DayLog>
  settings: { theme: 'light' | 'dark' }
}

export const defaultState: AppState = {
  tasks: {},
  months: {},
  days: {},
  settings: { theme: 'light' },
}

export function getMonthPlan(state: AppState, month: string): MonthPlan {
  return state.months[month] ?? { month, mainTaskIds: [] }
}

export function getDayLog(state: AppState, date: string): DayLog {
  return state.days[date] ?? { date, done: {}, addonTaskIds: [] }
}

export function getDayTaskIds(state: AppState, date: string): string[] {
  const month = date.slice(0, 7)
  const plan = getMonthPlan(state, month)
  const log = getDayLog(state, date)
  return [...new Set([...plan.mainTaskIds, ...log.addonTaskIds])]
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Mutations — return new state (immutable)
export function addTask(state: AppState, title: string): [AppState, string] {
  const id = nanoid()
  const task: Task = { id, title: title.trim(), createdAt: new Date().toISOString() }
  return [{ ...state, tasks: { ...state.tasks, [id]: task } }, id]
}

export function removeTask(state: AppState, id: string): AppState {
  const tasks = { ...state.tasks }
  delete tasks[id]
  return { ...state, tasks }
}

export function renameTask(state: AppState, id: string, title: string): AppState {
  return { ...state, tasks: { ...state.tasks, [id]: { ...state.tasks[id], title: title.trim() } } }
}

export function addMainTask(state: AppState, month: string, taskId: string): AppState {
  const plan = getMonthPlan(state, month)
  if (plan.mainTaskIds.includes(taskId)) return state
  return { ...state, months: { ...state.months, [month]: { ...plan, mainTaskIds: [...plan.mainTaskIds, taskId] } } }
}

export function removeMainTask(state: AppState, month: string, taskId: string): AppState {
  const plan = getMonthPlan(state, month)
  return { ...state, months: { ...state.months, [month]: { ...plan, mainTaskIds: plan.mainTaskIds.filter(id => id !== taskId) } } }
}

export function addAddonTask(state: AppState, date: string, taskId: string): AppState {
  const log = getDayLog(state, date)
  if (log.addonTaskIds.includes(taskId)) return state
  return { ...state, days: { ...state.days, [date]: { ...log, addonTaskIds: [...log.addonTaskIds, taskId] } } }
}

export function setTaskDone(state: AppState, date: string, taskId: string, done: boolean): AppState {
  const log = getDayLog(state, date)
  return { ...state, days: { ...state.days, [date]: { ...log, done: { ...log.done, [taskId]: done } } } }
}

export function setTheme(state: AppState, theme: 'light' | 'dark'): AppState {
  return { ...state, settings: { ...state.settings, theme } }
}
