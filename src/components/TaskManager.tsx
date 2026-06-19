import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AppState,
  addTask,
  addMainTask,
  removeMainTask,
  getMonthPlan,
} from "../lib/store";
import { currentMonth } from "../lib/dates";
import { useT } from "../lib/i18n";

type Props = {
  state: AppState;
  setState: (s: AppState) => void;
  embedded?: boolean;
};

export default function TaskManager({
  state,
  setState,
  embedded = false,
}: Props) {
  const { t } = useT();
  const month = currentMonth();
  const plan = getMonthPlan(state, month);
  const [newTitle, setNewTitle] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const [s2, id] = addTask(state, newTitle.trim());
    setState(addMainTask(s2, month, id));
    setNewTitle("");
  }

  function handleRemove(taskId: string) {
    setState(removeMainTask(state, month, taskId));
  }

  return (
    <div
      className={
        embedded
          ? "flex flex-col gap-3"
          : "flex flex-col gap-3 rounded-2xl border border-sprout-100 bg-surface p-4 dark:border-sprout-900 dark:bg-surface-dark-muted"
      }
    >
      {!embedded && (
        <h3 className="text-sm font-semibold text-ink dark:text-surface">
          {t("taskmgr.title")}
        </h3>
      )}

      {plan.mainTaskIds.length === 0 && (
        <p className="text-xs text-ink-subtle dark:text-surface-muted">
          {t("taskmgr.empty")}
        </p>
      )}

      {plan.mainTaskIds.map((id) => {
        const task = state.tasks[id];
        if (!task) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-2 rounded-2xl border border-sprout-100 bg-surface-muted px-3 py-2 dark:border-sprout-950 dark:bg-surface-dark"
          >
            <span className="flex-1 text-sm text-ink dark:text-surface">
              {task.title}
            </span>
            <button
              data-flat
              onClick={() => handleRemove(id)}
              aria-label={t("taskmgr.removeAria", { title: task.title })}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-ink-subtle hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        );
      })}

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={t("taskmgr.placeholder")}
          aria-label={t("taskmgr.newAria")}
          className="flex-1 px-3 py-2 rounded-xl border border-sprout-100 dark:border-sprout-900 bg-surface-muted dark:bg-surface-dark text-sm text-ink dark:text-surface placeholder-ink-subtle dark:placeholder-surface-muted focus:border-sprout-400 transition-colors"
        />
        <button
          type="submit"
          aria-label={t("taskmgr.addAria")}
          className="min-w-[44px] min-h-[44px] px-3 py-2 bg-sprout-600 hover:bg-sprout-700 text-white rounded-xl text-sm transition-colors"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
