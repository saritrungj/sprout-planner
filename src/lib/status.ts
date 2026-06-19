import { AppState, getDayLog, getDayTaskIds } from "./store";
import { todayISO, buildHeatmapDates, buildMonthGrid } from "./dates";

export type DayStatus = "complete" | "missed" | "in-progress" | "neutral";

/** Single source of truth for status → Tailwind class mappings. */
export const statusStyles = {
  complete: {
    bg: "bg-sprout-500",
    bgLight: "bg-sprout-50 dark:bg-sprout-950",
    border: "border-sprout-200 dark:border-sprout-800",
    ring: "ring-2 ring-sprout-300 dark:ring-sprout-600",
    text: "text-white",
    badge: "bg-sprout-500 text-white",
    stamp: "bg-sprout-500 text-white shadow-sm",
  },
  "in-progress": {
    bg: "bg-amber-300 dark:bg-amber-700",
    bgLight: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    ring: "ring-2 ring-amber-300",
    text: "text-amber-900 dark:text-amber-100",
    badge: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
    stamp: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  missed: {
    bg: "bg-red-300 dark:bg-red-800",
    bgLight: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    ring: "ring-2 ring-red-300",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    stamp: "bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400",
  },
  neutral: {
    bg: "bg-surface-muted dark:bg-surface-dark-muted",
    bgLight: "bg-transparent",
    border: "border-sprout-100 dark:border-sprout-900",
    ring: "",
    text: "text-ink-muted dark:text-surface-muted",
    badge: "bg-surface-muted dark:bg-surface-dark-muted text-ink-muted",
    stamp: "",
  },
} satisfies Record<DayStatus, Record<string, string>>;

export function getDayStatus(state: AppState, date: string): DayStatus {
  const today = todayISO();
  const taskIds = getDayTaskIds(state, date);
  if (taskIds.length === 0) return "neutral";
  if (date > today) return "neutral";

  const log = getDayLog(state, date);
  const allDone = taskIds.every((id) => log.done[id]);

  if (allDone) return "complete";
  if (date === today) return "in-progress";
  return "missed";
}

export function getCompletionRatio(state: AppState, date: string): number {
  const taskIds = getDayTaskIds(state, date);
  if (taskIds.length === 0) return 0;
  const log = getDayLog(state, date);
  const done = taskIds.filter((id) => log.done[id]).length;
  return done / taskIds.length;
}

export type StreakInfo = { current: number; best: number };

export function getStreak(state: AppState): StreakInfo {
  const today = todayISO();
  let current = 0;
  let best = 0;
  let streak = 0;
  let d = new Date(today);

  // Walk backwards day by day until we hit neutral or missed
  while (true) {
    const dateStr = d.toISOString().slice(0, 10);
    const status = getDayStatus(state, dateStr);
    if (status === "complete") {
      streak++;
      if (streak > best) best = streak;
    } else if (status === "in-progress" && dateStr === today) {
      // today not yet done — still counts toward potential streak
      d.setDate(d.getDate() - 1);
      continue;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  current = streak;

  // Scan all history for best streak (if best from current walk isn't already from history)
  // Find all complete days and compute longest run
  const allDates = Object.keys(state.days).sort();
  let runBest = 0;
  let run = 0;
  let prev = "";
  for (const date of allDates) {
    const status = getDayStatus(state, date);
    if (status === "complete") {
      if (prev) {
        const prevD = new Date(prev);
        const curD = new Date(date);
        const diff = (curD.getTime() - prevD.getTime()) / 86400000;
        if (diff === 1) {
          run++;
        } else {
          run = 1;
        }
      } else {
        run = 1;
      }
      if (run > runBest) runBest = run;
      prev = date;
    } else {
      prev = "";
      run = 0;
    }
  }
  best = Math.max(current, runBest);

  return { current, best };
}

export type MonthStats = {
  completionPct: number;
  greenDays: number;
  totalDays: number;
  tasksCompleted: number;
};

export function getMonthStats(state: AppState, month: string): MonthStats {
  const today = todayISO();
  const grid = buildMonthGrid(month);
  const dates = grid
    .flat()
    .filter((d): d is string => d !== null && d <= today);
  let green = 0,
    tasksCompleted = 0,
    counted = 0;
  for (const date of dates) {
    const taskIds = getDayTaskIds(state, date);
    if (taskIds.length === 0) continue;
    counted++;
    const log = getDayLog(state, date);
    const done = taskIds.filter((id) => log.done[id]).length;
    tasksCompleted += done;
    if (taskIds.every((id) => log.done[id])) green++;
  }
  return {
    completionPct: counted === 0 ? 0 : Math.round((green / counted) * 100),
    greenDays: green,
    totalDays: counted,
    tasksCompleted,
  };
}

/** Count of days the user logged at least one completed task. */
export function getDaysTended(state: AppState): number {
  return Object.values(state.days).filter((log) =>
    Object.values(log.done).some(Boolean),
  ).length;
}

export type HeatmapCell = { date: string; ratio: number; status: DayStatus };

export function getHeatmapData(state: AppState, weeks = 26): HeatmapCell[] {
  return buildHeatmapDates(weeks).map((date) => ({
    date,
    ratio: getCompletionRatio(state, date),
    status: getDayStatus(state, date),
  }));
}
