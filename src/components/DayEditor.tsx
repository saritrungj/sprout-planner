import { useEffect, useRef, useState } from "react";
import { X, Plus, Check } from "lucide-react";
import {
  AppState,
  getDayTaskIds,
  getDayLog,
  setTaskDone,
  addTask,
  addAddonTask,
} from "../lib/store";
import { formatDayLabel, todayISO } from "../lib/dates";
import { getDayStatus, statusStyles } from "../lib/status";
import { useT } from "../lib/i18n";

type Props = {
  date: string;
  state: AppState;
  setState: (s: AppState) => void;
  onClose: () => void;
};

export default function DayEditor({ date, state, setState, onClose }: Props) {
  const { t, locale } = useT();
  const taskIds = getDayTaskIds(state, date);
  const log = getDayLog(state, date);
  const status = getDayStatus(state, date);
  const today = todayISO();
  const isFuture = date > today;
  const [newTask, setNewTask] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = `day-editor-title-${date}`;

  // Move focus into dialog on open; restore on close
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      previous?.focus();
    };
  }, []);

  // Focus trap and Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggle(taskId: string) {
    setState(setTaskDone(state, date, taskId, !log.done[taskId]));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const [s2, id] = addTask(state, newTask.trim());
    setState(addAddonTask(s2, date, id));
    setNewTask("");
  }

  const st = statusStyles[status];
  const statusMascot =
    status === "complete"
      ? "/sprout-success.png"
      : status === "missed"
        ? "/sprout-fail.png"
        : status === "in-progress"
          ? "/sprout-progress.png"
          : isFuture
            ? "/sprout-neutral.png"
            : "/sprout-empty.png";
  const statusLabel =
    status === "complete"
      ? t("status.done")
      : status === "in-progress"
        ? t("status.inProgress")
        : status === "missed"
          ? t("status.missed")
          : "";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
      >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pointer-events-auto w-full max-w-md bg-surface dark:bg-surface-dark-muted rounded-3xl shadow-2xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={statusMascot}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 flex-shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs text-ink-subtle dark:text-surface-muted uppercase tracking-wide">
                {isFuture
                  ? t("day.planning")
                  : date < today
                    ? t("day.past")
                    : t("day.today")}
              </p>
              <h2
                id={titleId}
                className="text-lg font-bold font-sans text-ink dark:text-surface"
              >
                {formatDayLabel(date, locale)}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusLabel && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${st.badge}`}
              >
                {statusLabel}
              </div>
            )}
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label={t("common.close")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-ink-subtle hover:text-ink dark:hover:text-surface transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex flex-col gap-2">
          {taskIds.length === 0 && (
            <p className="text-sm text-ink-subtle dark:text-surface-muted py-4 text-center">
              {t("day.empty")}
            </p>
          )}
          {taskIds.map((id) => {
            const task = state.tasks[id];
            if (!task) return null;
            const isDone = !!log.done[id];
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                aria-pressed={isDone}
                aria-label={t(isDone ? "task.unmark" : "task.mark", {
                  title: task.title,
                })}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                  ${
                    isDone
                      ? "bg-sprout-50 dark:bg-sprout-950 border-sprout-200 dark:border-sprout-800"
                      : "bg-surface dark:bg-surface-dark border-gray-100 dark:border-gray-700 hover:border-sprout-200"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isDone ? "bg-sprout-500 border-sprout-500" : "border-gray-300 dark:border-gray-600"}`}
                  aria-hidden="true"
                >
                  {isDone && <Check size={12} className="text-white" />}
                </div>
                <span
                  className={`text-sm ${
                    isDone
                      ? "line-through text-ink-subtle dark:text-surface-muted"
                      : "text-ink dark:text-surface"
                  }`}
                >
                  {task.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add task */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={t("day.addPlaceholder")}
            aria-label={t("day.newTaskAria")}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-muted dark:bg-surface-dark text-sm text-ink dark:text-surface placeholder-ink-subtle dark:placeholder-surface-muted focus:border-sprout-400 transition-colors"
          />
          <button
            type="submit"
            aria-label={t("task.addAria")}
            className="min-w-[44px] min-h-[44px] px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white rounded-xl transition-colors"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
