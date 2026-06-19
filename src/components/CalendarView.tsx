import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";
import { AppState } from "../lib/store";
import {
  buildMonthGrid,
  currentMonth,
  prevMonth,
  nextMonth,
  formatMonthLabel,
  todayISO,
  weekdayLabels,
} from "../lib/dates";
import {
  getDayStatus,
  getMonthStats,
  statusStyles,
  DayStatus,
} from "../lib/status";
import { useT } from "../lib/i18n";
import DayEditor from "./DayEditor";

type Props = {
  state: AppState;
  setState: (s: AppState) => void;
};

function DayStamp({
  status,
  date,
  today,
}: {
  status: DayStatus;
  date: string;
  today: string;
}) {
  const isToday = date === today;
  const base =
    "w-full aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all";
  const st = statusStyles[status];
  const todayRing =
    isToday && status === "neutral"
      ? "ring-2 ring-sprout-300 dark:ring-sprout-600"
      : "";

  if (status === "complete") {
    return (
      <div
        className={`${base} ${st.stamp} ${isToday ? "ring-2 ring-sprout-300" : ""}`}
        aria-hidden="true"
      >
        <Check size={15} strokeWidth={3} aria-hidden="true" />
      </div>
    );
  }

  if (status === "missed") {
    return (
      <div
        className={`${base} ${st.stamp} ${isToday ? "ring-2 ring-red-300" : ""}`}
        aria-hidden="true"
      >
        <X size={15} strokeWidth={3} aria-hidden="true" />
      </div>
    );
  }

  if (status === "in-progress") {
    return (
      <div
        className={`${base} ${st.stamp} ring-2 ring-amber-300`}
        aria-hidden="true"
      >
        <MoreHorizontal size={15} strokeWidth={3} aria-hidden="true" />
      </div>
    );
  }

  return <div className={`${base} ${todayRing}`} aria-hidden="true" />;
}

export default function CalendarView({ state, setState }: Props) {
  const { t, locale } = useT();
  const [month, setMonth] = useState(currentMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const today = todayISO();
  const grid = buildMonthGrid(month);
  const dayLabels = weekdayLabels(locale, "short");
  const stats = getMonthStats(state, month);

  const statusName: Record<DayStatus, string> = {
    complete: t("cal.complete"),
    missed: t("cal.missed"),
    "in-progress": t("cal.inProgress"),
    neutral: "",
  };

  return (
    <div className="mx-auto grid min-h-full w-full max-w-6xl content-start gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6 lg:px-8 lg:py-8">
      <header className="flex items-end justify-between gap-4 lg:col-span-2">
        <h1 className="font-sans text-3xl font-bold text-ink dark:text-surface">
          {t("nav.calendar")}
        </h1>
      </header>

      <section className="flex min-h-[min(42rem,calc(100dvh-8rem))] flex-col gap-4 rounded-[1.5rem] border border-sprout-100 bg-surface p-4 dark:border-sprout-900 dark:bg-surface-dark-muted sm:p-5">
        <div className="flex items-center justify-between">
          <button
            data-flat
            onClick={() => setMonth(prevMonth(month))}
            aria-label={t("cal.prev")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 text-ink-muted dark:text-surface-muted transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <h2 className="text-lg font-bold font-sans text-ink dark:text-surface">
            {formatMonthLabel(month, locale)}
          </h2>
          <button
            data-flat
            onClick={() => setMonth(nextMonth(month))}
            aria-label={t("cal.next")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 text-ink-muted dark:text-surface-muted transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1" aria-hidden="true">
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className="text-center text-xs text-ink-subtle dark:text-surface-muted font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-1"
          role="grid"
          aria-label={formatMonthLabel(month, locale)}
        >
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1" role="row">
              {week.map((date, di) => {
                if (!date) {
                  return <div key={di} role="gridcell" aria-hidden="true" />;
                }
                const status = getDayStatus(state, date);
                const dayNum = parseInt(date.slice(8));
                const statusText = statusName[status]
                  ? `, ${statusName[status]}`
                  : "";
                return (
                  <div key={date} role="gridcell">
                    <button
                      data-flat
                      onClick={() => setSelected(date)}
                      aria-label={`${date === today ? t("day.today") + ", " : ""}${date}${statusText}`}
                      className="w-full flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-sprout-50 dark:hover:bg-sprout-950 transition-colors"
                    >
                      <span
                        className={`text-xs font-medium ${
                          date === today
                            ? "text-sprout-600 dark:text-sprout-400 font-bold"
                            : "text-ink-muted dark:text-surface-muted"
                        }`}
                        aria-hidden="true"
                      >
                        {dayNum}
                      </span>
                      <DayStamp status={status} date={date} today={today} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-xs text-ink-subtle dark:text-surface-muted"
        >
          <LegendDot className="bg-sprout-500" label={t("cal.complete")} />
          <LegendDot
            className="bg-red-100 dark:bg-red-950"
            label={t("cal.missed")}
          />
          <LegendDot
            className="bg-amber-100 dark:bg-amber-950"
            label={t("cal.inProgress")}
          />
        </div>
      </section>

      <aside className="rounded-[1.5rem] border border-sprout-100 bg-surface-muted p-5 dark:border-sprout-900 dark:bg-surface-dark-muted lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle dark:text-surface-muted">
          {formatMonthLabel(month, locale)}
        </p>
        <div className="mt-4 divide-y divide-sprout-100 dark:divide-sprout-950">
          <InsightRow
            label={t("dash.completion")}
            value={`${stats.completionPct}%`}
          />
          <InsightRow
            label={t("dash.greenDays")}
            value={`${stats.greenDays}`}
            sub={t("dash.ofTracked", { n: stats.totalDays })}
          />
          <InsightRow
            label={t("dash.tasksDone")}
            value={`${stats.tasksCompleted}`}
          />
        </div>
        <div className="mt-5 grid gap-2 text-xs text-ink-subtle dark:text-surface-muted">
          <LegendDot className="bg-sprout-500" label={t("cal.complete")} />
          <LegendDot
            className="bg-amber-100 dark:bg-amber-950"
            label={t("cal.inProgress")}
          />
          <LegendDot
            className="bg-red-100 dark:bg-red-950"
            label={t("cal.missed")}
          />
        </div>
      </aside>

      {selected && (
        <DayEditor
          date={selected}
          state={state}
          setState={setState}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function InsightRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-subtle dark:text-surface-muted">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-[11px] text-ink-subtle dark:text-surface-muted">
            {sub}
          </p>
        )}
      </div>
      <p className="font-sans text-2xl font-bold tabular-nums text-ink dark:text-surface">
        {value}
      </p>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
