/** Optional time-of-day grouping for a task. */
export type Slot = "morning" | "afternoon" | "evening";

export type Task = {
  id: string;
  title: string;
  createdAt: string;
  slot?: Slot;
};

/** Mascot avatar poses the user can pick (maps to /sprout-<key>.png). */
export type MascotKey =
  | "neutral"
  | "success"
  | "streak"
  | "rest"
  | "progress"
  | "empty"
  | "work";

export type Reminders = { enabled: boolean; time: string };

export type MonthPlan = {
  month: string; // "2026-06"
  mainTaskIds: string[];
};

export type DayLog = {
  date: string; // "2026-06-19"
  done: Record<string, boolean>;
  addonTaskIds: string[];
};

export type Lang = "en" | "th" | "zh-CN" | "zh-TW";

export type Settings = {
  theme: "light" | "dark";
  language: Lang;
  zenMode: boolean;
  mascot: MascotKey;
  reminders: Reminders;
};

export type AppState = {
  tasks: Record<string, Task>;
  months: Record<string, MonthPlan>;
  days: Record<string, DayLog>;
  settings: Settings;
};

export const defaultState: AppState = {
  tasks: {},
  months: {},
  days: {},
  settings: {
    theme: "light",
    language: "en",
    zenMode: false,
    mascot: "neutral",
    reminders: { enabled: false, time: "20:00" },
  },
};

export function getMonthPlan(state: AppState, month: string): MonthPlan {
  return state.months[month] ?? { month, mainTaskIds: [] };
}

export function getDayLog(state: AppState, date: string): DayLog {
  return state.days[date] ?? { date, done: {}, addonTaskIds: [] };
}

export function getDayTaskIds(state: AppState, date: string): string[] {
  const month = date.slice(0, 7);
  const plan = getMonthPlan(state, month);
  const log = getDayLog(state, date);
  return [...new Set([...plan.mainTaskIds, ...log.addonTaskIds])];
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Mutations — return new state (immutable)
export function addTask(
  state: AppState,
  title: string,
  slot?: Slot,
): [AppState, string] {
  const id = nanoid();
  const task: Task = {
    id,
    title: title.trim(),
    createdAt: new Date().toISOString(),
    ...(slot ? { slot } : {}),
  };
  return [{ ...state, tasks: { ...state.tasks, [id]: task } }, id];
}

export function setTaskSlot(
  state: AppState,
  id: string,
  slot: Slot | undefined,
): AppState {
  const task = state.tasks[id];
  if (!task) return state;
  return {
    ...state,
    tasks: { ...state.tasks, [id]: { ...task, slot } },
  };
}

export function removeTask(state: AppState, id: string): AppState {
  const tasks = { ...state.tasks };
  delete tasks[id];
  return { ...state, tasks };
}

export function renameTask(
  state: AppState,
  id: string,
  title: string,
): AppState {
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [id]: { ...state.tasks[id], title: title.trim() },
    },
  };
}

export function addMainTask(
  state: AppState,
  month: string,
  taskId: string,
): AppState {
  const plan = getMonthPlan(state, month);
  if (plan.mainTaskIds.includes(taskId)) return state;
  return {
    ...state,
    months: {
      ...state.months,
      [month]: { ...plan, mainTaskIds: [...plan.mainTaskIds, taskId] },
    },
  };
}

export function removeMainTask(
  state: AppState,
  month: string,
  taskId: string,
): AppState {
  const plan = getMonthPlan(state, month);
  return {
    ...state,
    months: {
      ...state.months,
      [month]: {
        ...plan,
        mainTaskIds: plan.mainTaskIds.filter((id) => id !== taskId),
      },
    },
  };
}

export function addAddonTask(
  state: AppState,
  date: string,
  taskId: string,
): AppState {
  const log = getDayLog(state, date);
  if (log.addonTaskIds.includes(taskId)) return state;
  return {
    ...state,
    days: {
      ...state.days,
      [date]: { ...log, addonTaskIds: [...log.addonTaskIds, taskId] },
    },
  };
}

export function removeAddonTask(
  state: AppState,
  date: string,
  taskId: string,
): AppState {
  const log = getDayLog(state, date);
  const done = { ...log.done };
  delete done[taskId];
  return {
    ...state,
    days: {
      ...state.days,
      [date]: {
        ...log,
        addonTaskIds: log.addonTaskIds.filter((id) => id !== taskId),
        done,
      },
    },
  };
}

export function setTaskDone(
  state: AppState,
  date: string,
  taskId: string,
  done: boolean,
): AppState {
  const log = getDayLog(state, date);
  return {
    ...state,
    days: {
      ...state.days,
      [date]: { ...log, done: { ...log.done, [taskId]: done } },
    },
  };
}

export function setTheme(state: AppState, theme: "light" | "dark"): AppState {
  return { ...state, settings: { ...state.settings, theme } };
}

export function setLanguage(state: AppState, language: Lang): AppState {
  return { ...state, settings: { ...state.settings, language } };
}

export function setZenMode(state: AppState, zenMode: boolean): AppState {
  return { ...state, settings: { ...state.settings, zenMode } };
}

export function setMascot(state: AppState, mascot: MascotKey): AppState {
  return { ...state, settings: { ...state.settings, mascot } };
}

export function setReminders(state: AppState, reminders: Reminders): AppState {
  return { ...state, settings: { ...state.settings, reminders } };
}
