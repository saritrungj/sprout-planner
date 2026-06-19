import {
  ListChecks,
  CalendarDays,
  LayoutDashboard,
  Settings,
  LucideIcon,
} from "lucide-react";
import { AppState, Lang } from "../lib/store";
import { getStreak, getDaysTended } from "../lib/status";
import { useT } from "../lib/i18n";
import LanguageSelect from "./LanguageSelect";
import ThemeToggle from "./ThemeToggle";

export type Tab = "today" | "calendar" | "dashboard" | "settings";

const NAV: { id: Tab; labelKey: string; Icon: LucideIcon }[] = [
  { id: "today", labelKey: "nav.today", Icon: ListChecks },
  { id: "calendar", labelKey: "nav.calendar", Icon: CalendarDays },
  { id: "dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { id: "settings", labelKey: "nav.settings", Icon: Settings },
];

type NavProps = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

type ShellProps = NavProps & {
  state: AppState;
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Lang) => void;
};

/* ── Desktop: left sidebar ─────────────────────────────────────────── */
export function SideNav({
  active,
  onChange,
  state,
  onToggleTheme,
  onChangeLanguage,
}: ShellProps) {
  const { t } = useT();
  const streak = getStreak(state);
  const tended = getDaysTended(state);

  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed left-0 top-0 z-40 hidden h-dvh w-72 flex-col gap-1 border-r border-sprout-100 bg-surface-muted/95 p-4 backdrop-blur-md dark:border-sprout-900 dark:bg-surface-dark-muted/95 lg:flex"
    >
      {/* Brand */}
      <div className="mb-5 flex items-center gap-2 px-2 py-1">
        <img
          src="/sprout-logo.png"
          alt=""
          aria-hidden="true"
          className="h-9 w-9 object-contain"
        />
        <span className="font-sans text-lg font-bold text-sprout-700 dark:text-sprout-400">
          Sprout
        </span>
      </div>

      {/* Companion profile */}
      <div className="mb-5 flex items-center gap-3 rounded-[1.35rem] border border-sprout-100 bg-surface p-3 dark:border-sprout-900 dark:bg-surface-dark">
        <img
          src={`/sprout-${state.settings.mascot}.png`}
          alt=""
          aria-hidden="true"
          className="h-12 w-12 flex-shrink-0 object-contain"
          style={{ animation: "streak-float 4.6s ease-in-out infinite" }}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink dark:text-surface">
            {streak.current > 0
              ? t("headline.streak", { n: streak.current })
              : t("today.streakStart")}
          </p>
          <p className="text-xs text-ink-subtle dark:text-surface-muted tabular-nums">
            {tended} {t("settings.daysTended").toLowerCase()}
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-1">
        {NAV.map(({ id, labelKey, Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              data-flat
              aria-current={selected ? "page" : undefined}
              onClick={() => onChange(id)}
              className={`flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all
                ${
                  selected
                    ? "bg-sprout-100 text-sprout-800 dark:bg-sprout-950 dark:text-sprout-200"
                    : "text-ink-muted hover:bg-surface hover:text-sprout-700 dark:text-surface-muted dark:hover:bg-surface-dark dark:hover:text-sprout-300"
                }`}
            >
              <Icon
                size={20}
                strokeWidth={selected ? 2.4 : 2}
                aria-hidden="true"
              />
              {t(labelKey)}
            </button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="mt-auto flex items-center justify-between gap-1 border-t border-sprout-100 pt-3 dark:border-sprout-900">
        <LanguageSelect
          value={state.settings.language}
          onChange={onChangeLanguage}
        />
        <ThemeToggle theme={state.settings.theme} onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}

/* ── Mobile/tablet: top bar ────────────────────────────────────────── */
export function MobileTopBar({
  state,
  onToggleTheme,
  onChangeLanguage,
}: Omit<ShellProps, "active" | "onChange">) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sprout-100/70 bg-surface/85 px-4 py-3 backdrop-blur-md dark:border-sprout-900/70 dark:bg-surface-dark/85 lg:hidden">
      <div className="flex items-center gap-2">
        <img
          src="/sprout-logo.png"
          alt=""
          aria-hidden="true"
          className="h-8 w-8 object-contain"
        />
        <span className="font-sans text-lg font-bold text-sprout-700 dark:text-sprout-400">
          Sprout
        </span>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSelect
          value={state.settings.language}
          onChange={onChangeLanguage}
        />
        <ThemeToggle theme={state.settings.theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

/* ── Mobile/tablet: bottom nav ─────────────────────────────────────── */
export function BottomNav({ active, onChange }: NavProps) {
  const { t } = useT();
  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-3 bottom-3 z-50 flex items-stretch justify-around rounded-[1.75rem] border border-sprout-100 bg-surface/95 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_16px_40px_rgba(22,101,52,0.14)] backdrop-blur-md dark:border-sprout-900 dark:bg-surface-dark/95 lg:hidden"
    >
      {NAV.map(({ id, labelKey, Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            data-flat
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(id)}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-[11px] font-semibold transition-all
              ${
                selected
                  ? "bg-sprout-50 text-sprout-700 shadow-sm dark:bg-sprout-950 dark:text-sprout-300"
                  : "text-ink-subtle hover:bg-surface-muted hover:text-sprout-700 dark:text-surface-muted dark:hover:bg-surface-dark-muted dark:hover:text-sprout-300"
              }`}
          >
            <span
              className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                selected ? "bg-surface dark:bg-surface-dark" : ""
              }`}
            >
              <Icon
                size={20}
                strokeWidth={selected ? 2.4 : 2}
                aria-hidden="true"
              />
            </span>
            {t(labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
