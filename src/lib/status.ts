import { AppState, getDayLog, getDayTaskIds } from './store'
import { todayISO, buildHeatmapDates, buildMonthGrid } from './dates'

export type DayStatus = 'complete' | 'missed' | 'in-progress' | 'neutral'

export function getDayStatus(state: AppState, date: string): DayStatus {
  const today = todayISO()
  const taskIds = getDayTaskIds(state, date)
  if (taskIds.length === 0) return 'neutral'
  if (date > today) return 'neutral'

  const log = getDayLog(state, date)
  const allDone = taskIds.every(id => log.done[id])

  if (allDone) return 'complete'
  if (date === today) return 'in-progress'
  return 'missed'
}

export function getCompletionRatio(state: AppState, date: string): number {
  const taskIds = getDayTaskIds(state, date)
  if (taskIds.length === 0) return 0
  const log = getDayLog(state, date)
  const done = taskIds.filter(id => log.done[id]).length
  return done / taskIds.length
}

export type StreakInfo = { current: number; best: number }

export function getStreak(state: AppState): StreakInfo {
  const today = todayISO()
  let current = 0
  let best = 0
  let streak = 0
  let d = new Date(today)

  // Walk backwards day by day until we hit neutral or missed
  while (true) {
    const dateStr = d.toISOString().slice(0, 10)
    const status = getDayStatus(state, dateStr)
    if (status === 'complete') {
      streak++
      if (streak > best) best = streak
    } else if (status === 'in-progress' && dateStr === today) {
      // today not yet done — still counts toward potential streak
      d.setDate(d.getDate() - 1)
      continue
    } else {
      break
    }
    d.setDate(d.getDate() - 1)
  }
  current = streak

  // Scan all history for best streak (if best from current walk isn't already from history)
  // Find all complete days and compute longest run
  const allDates = Object.keys(state.days).sort()
  let runBest = 0
  let run = 0
  let prev = ''
  for (const date of allDates) {
    const status = getDayStatus(state, date)
    if (status === 'complete') {
      if (prev) {
        const prevD = new Date(prev)
        const curD = new Date(date)
        const diff = (curD.getTime() - prevD.getTime()) / 86400000
        if (diff === 1) { run++ } else { run = 1 }
      } else { run = 1 }
      if (run > runBest) runBest = run
      prev = date
    } else { prev = ''; run = 0 }
  }
  best = Math.max(current, runBest)

  return { current, best }
}

export type MonthStats = {
  completionPct: number
  greenDays: number
  totalDays: number
  tasksCompleted: number
}

export function getMonthStats(state: AppState, month: string): MonthStats {
  const today = todayISO()
  const grid = buildMonthGrid(month)
  const dates = grid.flat().filter((d): d is string => d !== null && d <= today)
  let green = 0, tasksCompleted = 0, counted = 0
  for (const date of dates) {
    const taskIds = getDayTaskIds(state, date)
    if (taskIds.length === 0) continue
    counted++
    const log = getDayLog(state, date)
    const done = taskIds.filter(id => log.done[id]).length
    tasksCompleted += done
    if (taskIds.every(id => log.done[id])) green++
  }
  return {
    completionPct: counted === 0 ? 0 : Math.round((green / counted) * 100),
    greenDays: green,
    totalDays: counted,
    tasksCompleted,
  }
}

export type HeatmapCell = { date: string; ratio: number; status: DayStatus }

export function getHeatmapData(state: AppState, weeks = 26): HeatmapCell[] {
  return buildHeatmapDates(weeks).map(date => ({
    date,
    ratio: getCompletionRatio(state, date),
    status: getDayStatus(state, date),
  }))
}
