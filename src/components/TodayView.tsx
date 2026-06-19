import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Check,
  ChevronDown,
  Flame,
  X,
  Sunrise,
  Sun,
  Moon,
  Clock,
} from "lucide-react";
import {
  AppState,
  Slot,
  getDayTaskIds,
  getDayLog,
  getMonthPlan,
  setTaskDone,
  addTask,
  addAddonTask,
  removeAddonTask,
} from "../lib/store";
import { todayISO, formatDayLabel, weekdayLabels } from "../lib/dates";
import {
  getDayStatus,
  getStreak,
  getMonthStats,
  DayStatus,
} from "../lib/status";
import { useCountUp } from "../lib/useCountUp";
import { useT, TFn } from "../lib/i18n";
import InstallButton from "./InstallButton";
import Celebration from "./Celebration";

type Props = {
  state: AppState;
  setState: (s: AppState) => void;
};

const WEEK_CELL: Record<DayStatus, string> = {
  complete: "bg-sprout-500 text-white",
  "in-progress":
    "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  missed: "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
  neutral:
    "bg-surface-muted dark:bg-surface-dark-muted text-ink-subtle dark:text-surface-muted",
};

const SLOT_ORDER: Slot[] = ["morning", "afternoon", "evening"];
const SLOT_ICON: Record<Slot, typeof Sun> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

function lastSevenDays(): string[] {
  const [y, m, d] = todayISO().split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(y, m - 1, d - (6 - i));
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  });
}

function stageFor(pct: number, total: number) {
  if (total === 0)
    return { src: "/sprout-empty.png", key: "today.stage.empty" };
  if (pct >= 100)
    return { src: "/sprout-success.png", key: "today.stage.done" };
  if (pct >= 75)
    return { src: "/sprout-success.png", key: "today.stage.almost" };
  if (pct >= 50)
    return { src: "/sprout-empty.png", key: "today.stage.growing" };
  if (pct >= 25)
    return { src: "/sprout-progress.png", key: "today.stage.progress" };
  return { src: "/sprout-fail.png", key: "today.stage.start" };
}

export default function TodayView({ state, setState }: Props) {
  const { t, locale } = useT();
  const zen = state.settings.zenMode;
  const today = todayISO();
  const month = today.slice(0, 7);
  const taskIds = getDayTaskIds(state, today);
  const log = getDayLog(state, today);
  const status = getDayStatus(state, today);
  const mainIds = new Set(getMonthPlan(state, month).mainTaskIds);
  const [newTask, setNewTask] = useState("");
  const [newSlot, setNewSlot] = useState<Slot | "anytime">("anytime");
  const [burst, setBurst] = useState(0);

  const done = taskIds.filter((id) => log.done[id]).length;
  const total = taskIds.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const displayPct = useCountUp(pct, 700);

  const streak = getStreak(state);
  const stats = getMonthStats(state, month);
  const weekDays = weekdayLabels(locale, "narrow");
  const week = lastSevenDays();
  const stage = stageFor(pct, total);

  // Group task ids by slot (undefined slot → "anytime").
  const groups: Record<Slot | "anytime", string[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  };
  for (const id of taskIds) {
    const slot = state.tasks[id]?.slot ?? "anytime";
    groups[slot].push(id);
  }
  const usesSlots = SLOT_ORDER.some((s) => groups[s].length > 0);

  const wasComplete = useRef(status === "complete");
  useEffect(() => {
    if (status === "complete" && !wasComplete.current) setBurst((b) => b + 1);
    wasComplete.current = status === "complete";
  }, [status]);

  function toggle(taskId: string) {
    setState(setTaskDone(state, today, taskId, !log.done[taskId]));
  }
  function removeAddon(taskId: string) {
    setState(removeAddonTask(state, today, taskId));
  }
  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const [s2, id] = addTask(
      state,
      newTask.trim(),
      newSlot === "anytime" ? undefined : newSlot,
    );
    setState(addAddonTask(s2, today, id));
    setNewTask("");
  }
  function scrollToTasks() {
    document
      .getElementById("today-tasks")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderRow(id: string) {
    const task = state.tasks[id];
    if (!task) return null;
    const isDone = !!log.done[id];
    const isAddon = !mainIds.has(id);
    return (
      <li key={id} className="flex items-stretch gap-2">
        <button
          onClick={() => toggle(id)}
          aria-pressed={isDone}
          aria-label={t(isDone ? "task.unmark" : "task.mark", {
            title: task.title,
          })}
          className={`flex flex-1 items-center gap-3 rounded-2xl border p-4 text-left transition-all
            ${
              isDone
                ? "border-sprout-200 bg-sprout-50 dark:border-sprout-800 dark:bg-sprout-950"
                : "border-sprout-100 bg-surface hover:border-sprout-300 dark:border-sprout-900 dark:bg-surface-dark-muted"
            }`}
        >
          <span
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
              ${
                isDone
                  ? "border-sprout-500 bg-sprout-500"
                  : "border-sprout-200 dark:border-sprout-700"
              }`}
            aria-hidden="true"
          >
            {isDone && <Check size={14} className="text-white animate-bloom" />}
          </span>
          <span
            className={`text-sm font-medium ${
              isDone
                ? "text-ink-subtle line-through dark:text-surface-muted"
                : "text-ink dark:text-surface"
            }`}
          >
            {task.title}
          </span>
        </button>
        {isAddon && (
          <button
            onClick={() => removeAddon(id)}
            aria-label={t("today.removeAria", { title: task.title })}
            className="flex min-h-[44px] w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-sprout-100 bg-surface text-ink-subtle hover:border-red-300 hover:text-red-500 dark:border-sprout-900 dark:bg-surface-dark-muted dark:text-surface-muted dark:hover:text-red-400"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </li>
    );
  }

  return (
    <div className="min-h-full w-full">
      <Celebration burstKey={burst} />
      <button
        onClick={scrollToTasks}
        className="fixed bottom-24 left-4 z-40 inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-sprout-100 bg-surface/95 px-2.5 py-2 pr-3 text-xs font-bold uppercase tracking-wide text-ink-muted shadow-[0_16px_36px_rgba(22,101,52,0.16)] backdrop-blur-md transition-all hover:border-sprout-200 hover:bg-sprout-50 hover:text-sprout-700 dark:border-sprout-900 dark:bg-surface-dark-muted/95 dark:text-surface-muted dark:hover:border-sprout-800 dark:hover:bg-sprout-950 dark:hover:text-sprout-300 lg:bottom-6 lg:left-[19rem]"
        aria-label={t("today.scrollTasks")}
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sprout-50 ring-1 ring-sprout-100 dark:bg-sprout-950 dark:ring-sprout-900">
          <img
            src={stage.src}
            alt=""
            aria-hidden="true"
            className="h-9 w-9 object-contain"
            decoding="async"
          />
        </span>
        <span>{t("today.scrollTasks")}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sprout-100 text-sprout-700 transition-colors dark:bg-sprout-950 dark:text-sprout-300">
          <ChevronDown size={17} aria-hidden="true" className="scroll-cue" />
        </span>
      </button>

      {/* ── Progression hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100dvh-4.5rem)] w-full flex-col items-center justify-center overflow-hidden px-6 py-10 lg:min-h-dvh lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-sprout-50 to-surface dark:from-sprout-950/60 dark:to-surface-dark"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full origin-bottom bg-gradient-to-t from-sprout-300/45 via-sprout-200/20 to-transparent transition-transform duration-700 ease-out dark:from-sprout-700/40 dark:via-sprout-800/15"
          style={{
            transform: `scaleY(${Math.max(pct, total === 0 ? 4 : 6) / 100})`,
          }}
        />

        <p className="mb-2 text-sm font-medium text-ink-subtle dark:text-surface-muted">
          {formatDayLabel(today, locale)}
        </p>

        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute h-40 w-40 rounded-full bg-sprout-300/30 blur-3xl dark:bg-sprout-600/25 sm:h-56 sm:w-56"
          />
          <img
            key={stage.src}
            src={stage.src}
            alt=""
            aria-hidden="true"
            className="relative w-40 animate-bloom object-contain drop-shadow-[0_18px_30px_rgba(22,101,52,0.18)] sm:w-52 lg:w-60"
            style={{ animation: "streak-float 4.6s ease-in-out infinite" }}
          />
        </div>

        <div
          className="mt-4 flex flex-col items-center"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("today.progressAria", { pct })}
        >
          {!zen && (
            <div className="font-sans text-7xl font-bold leading-none tracking-tight text-ink dark:text-surface tabular-nums sm:text-8xl">
              {displayPct}
              <span className="align-top text-3xl text-sprout-600 dark:text-sprout-400 sm:text-4xl">
                %
              </span>
            </div>
          )}
          {total > 0 && (
            <p
              className={`text-sm font-medium text-ink-muted dark:text-surface-muted tabular-nums ${
                zen ? "" : "mt-2"
              }`}
            >
              {t("today.count", { done, total })}
            </p>
          )}
        </div>

        <p className="mt-3 max-w-xs text-center text-lg font-semibold text-ink dark:text-surface sm:text-xl">
          {t(stage.key)}
        </p>

        {!zen && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink dark:text-surface">
              <Flame
                size={16}
                aria-hidden="true"
                className={
                  streak.current > 0
                    ? "text-orange-500 dark:text-orange-400"
                    : "text-ink-subtle dark:text-surface-muted"
                }
              />
              {streak.current > 0
                ? t("headline.streak", { n: streak.current })
                : t("today.streakStart")}
            </span>
            {stats.totalDays > 0 && (
              <span className="text-ink-muted dark:text-surface-muted tabular-nums">
                {t("today.monthInline", { pct: stats.completionPct })}
              </span>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-5">
          <InstallButton />
        </div>
      </section>

      {/* ── Tasks ────────────────────────────────────────────────────── */}
      <section
        id="today-tasks"
        className="mx-auto flex min-h-full w-full max-w-2xl scroll-mt-20 flex-col gap-6 px-4 py-10 lg:px-6"
      >
        {/* This week */}
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle dark:text-surface-muted">
            {t("today.thisWeek")}
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((date) => {
              const st = getDayStatus(state, date);
              const isToday = date === today;
              const dayNum = parseInt(date.slice(8), 10);
              const letter = weekDays[new Date(date + "T00:00:00").getDay()];
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span
                    className="text-[10px] text-ink-subtle dark:text-surface-muted"
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                  <div
                    role="img"
                    aria-label={`${formatDayLabel(date, locale)} — ${t(
                      st === "complete"
                        ? "status.done"
                        : st === "in-progress"
                          ? "status.inProgress"
                          : st === "missed"
                            ? "status.missed"
                            : "day.empty",
                    )}`}
                    className={`flex aspect-square w-full items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums transition-colors ${
                      WEEK_CELL[st]
                    } ${
                      isToday
                        ? "ring-2 ring-sprout-400 ring-offset-1 ring-offset-surface dark:ring-sprout-500 dark:ring-offset-surface-dark"
                        : ""
                    }`}
                  >
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task list (grouped by time of day when slots are used) */}
        {taskIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sprout-200 py-10 text-center text-ink-subtle dark:border-sprout-900 dark:text-surface-muted">
            <img
              src="/sprout-empty.png"
              alt=""
              aria-hidden="true"
              className="mx-auto mb-3 h-20 w-20 object-contain"
            />
            <p className="text-sm">{t("today.empty")}</p>
          </div>
        ) : usesSlots ? (
          <div className="flex flex-col gap-5">
            {SLOT_ORDER.filter((s) => groups[s].length > 0).map((slot) => (
              <SlotGroup key={slot} slot={slot} t={t}>
                <ul className="flex flex-col gap-2">
                  {groups[slot].map(renderRow)}
                </ul>
              </SlotGroup>
            ))}
            {groups.anytime.length > 0 && (
              <SlotGroup slot="anytime" t={t}>
                <ul className="flex flex-col gap-2">
                  {groups.anytime.map(renderRow)}
                </ul>
              </SlotGroup>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">{taskIds.map(renderRow)}</ul>
        )}

        {/* Add today task with slot picker */}
        <form onSubmit={handleAddTask} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={t("today.addPlaceholder")}
              aria-label={t("today.newTaskAria")}
              className="flex-1 rounded-2xl border border-sprout-100 bg-surface px-4 py-3 text-sm text-ink placeholder-ink-subtle transition-colors focus:border-sprout-400 dark:border-sprout-900 dark:bg-surface-dark-muted dark:text-surface dark:placeholder-surface-muted"
            />
            <button
              type="submit"
              aria-label={t("task.addAria")}
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-sprout-600 px-4 py-3 text-white transition-colors hover:bg-sprout-700"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
          <label className="flex items-center gap-2 self-start text-xs text-ink-subtle dark:text-surface-muted">
            <Clock size={13} aria-hidden="true" />
            {t("slot.assign")}
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value as Slot | "anytime")}
              aria-label={t("slot.assign")}
              className="min-h-[44px] rounded-xl border border-sprout-100 bg-surface px-3 py-2 text-sm font-medium text-ink focus:border-sprout-400 dark:border-sprout-900 dark:bg-surface-dark-muted dark:text-surface"
            >
              <option value="anytime">{t("slot.anytime")}</option>
              <option value="morning">{t("slot.morning")}</option>
              <option value="afternoon">{t("slot.afternoon")}</option>
              <option value="evening">{t("slot.evening")}</option>
            </select>
          </label>
        </form>
      </section>
    </div>
  );
}

function SlotGroup({
  slot,
  t,
  children,
}: {
  slot: Slot | "anytime";
  t: TFn;
  children: React.ReactNode;
}) {
  const Icon = slot === "anytime" ? Clock : SLOT_ICON[slot];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-ink-muted dark:text-surface-muted">
        <Icon size={16} aria-hidden="true" />
        <h3 className="text-sm font-semibold">{t(`slot.${slot}`)}</h3>
      </div>
      {children}
    </div>
  );
}
