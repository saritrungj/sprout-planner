import { useState } from "react";
import { Moon, Sun, Bell, Sparkles, Leaf, Repeat2 } from "lucide-react";
import {
  AppState,
  MascotKey,
  setZenMode,
  setMascot,
  setReminders,
  setTheme,
} from "../lib/store";
import { getStreak, getDaysTended } from "../lib/status";
import {
  notifSupported,
  notifPermission,
  requestNotif,
} from "../lib/useReminders";
import { useT } from "../lib/i18n";
import TaskManager from "./TaskManager";

type Props = {
  state: AppState;
  setState: (s: AppState) => void;
};

const MASCOTS: MascotKey[] = [
  "neutral",
  "success",
  "streak",
  "rest",
  "progress",
  "empty",
  "work",
];

export default function SettingsView({ state, setState }: Props) {
  const { t } = useT();
  const { settings } = state;
  const streak = getStreak(state);
  const tended = getDaysTended(state);
  const [notifState, setNotifState] =
    useState<NotificationPermission>(notifPermission());

  async function toggleReminders() {
    if (!settings.reminders.enabled) {
      const perm = await requestNotif();
      setNotifState(perm);
      if (perm !== "granted") return;
      setState(setReminders(state, { ...settings.reminders, enabled: true }));
    } else {
      setState(setReminders(state, { ...settings.reminders, enabled: false }));
    }
  }

  function changeReminderTime(time: string) {
    setState(setReminders(state, { ...settings.reminders, time }));
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-6xl px-4 py-5 lg:px-8 lg:py-8">
      <header className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-ink dark:text-surface">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-surface-muted">
          {t("settings.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Recurring tasks */}
          <Section
            icon={<Repeat2 size={18} aria-hidden="true" />}
            title={t("taskmgr.title")}
            desc={t("settings.recurringDesc")}
          >
            <TaskManager state={state} setState={setState} embedded />
          </Section>

          {/* Preferences */}
          <Section
            icon={<Sparkles size={18} aria-hidden="true" />}
            title={t("settings.preferences")}
          >
            <div className="flex flex-col divide-y divide-sprout-100 dark:divide-sprout-950">
              <Row
                title={t("settings.zen")}
                desc={t("settings.zenDesc")}
                control={
                  <Toggle
                    checked={settings.zenMode}
                    onChange={(v) => setState(setZenMode(state, v))}
                    label={t("settings.zen")}
                  />
                }
              />
              <Row
                title={t("settings.reminders")}
                desc={t("settings.remindersDesc")}
                control={
                  <Toggle
                    checked={settings.reminders.enabled}
                    onChange={toggleReminders}
                    label={t("settings.reminders")}
                  />
                }
              >
                {settings.reminders.enabled && (
                  <div className="mt-3 flex items-center gap-2">
                    <Bell
                      size={15}
                      aria-hidden="true"
                      className="text-sprout-600 dark:text-sprout-400"
                    />
                    <label className="text-sm text-ink-muted dark:text-surface-muted">
                      {t("settings.reminderTime")}
                    </label>
                    <input
                      type="time"
                      value={settings.reminders.time}
                      onChange={(e) => changeReminderTime(e.target.value)}
                      className="rounded-xl border border-gray-200 bg-surface px-3 py-1.5 text-sm text-ink focus:border-sprout-400 dark:border-gray-700 dark:bg-surface-dark dark:text-surface"
                    />
                  </div>
                )}
                {!notifSupported() && (
                  <p className="mt-2 text-xs text-ink-subtle dark:text-surface-muted">
                    {t("settings.notifUnsupported")}
                  </p>
                )}
                {notifSupported() && notifState === "denied" && (
                  <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                    {t("settings.notifBlocked")}
                  </p>
                )}
              </Row>
            </div>
          </Section>

          {/* Appearance */}
          <Section
            icon={<Leaf size={18} aria-hidden="true" />}
            title={t("settings.appearance")}
          >
            <Row
              title={t("settings.themeLabel")}
              control={
                <div className="flex rounded-full border border-sprout-100 bg-surface-muted p-1 dark:border-sprout-900 dark:bg-surface-dark">
                  <ThemeChip
                    active={settings.theme === "light"}
                    onClick={() => setState(setTheme(state, "light"))}
                    icon={<Sun size={15} aria-hidden="true" />}
                    label={t("settings.themeLight")}
                  />
                  <ThemeChip
                    active={settings.theme === "dark"}
                    onClick={() => setState(setTheme(state, "dark"))}
                    icon={<Moon size={15} aria-hidden="true" />}
                    label={t("settings.themeDark")}
                  />
                </div>
              }
            />
          </Section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Companion picker */}
          <div className="rounded-2xl border border-sprout-100 bg-sprout-50 p-5 dark:border-sprout-900 dark:bg-sprout-950/40">
            <div className="flex flex-col items-center text-center">
              <img
                src={`/sprout-${settings.mascot}.png`}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="h-28 w-28 object-contain drop-shadow-[0_14px_24px_rgba(22,101,52,0.18)]"
                style={{ animation: "streak-float 4.6s ease-in-out infinite" }}
              />
              <h2 className="mt-2 text-base font-bold text-sprout-800 dark:text-sprout-200">
                {t("settings.companion")}
              </h2>
              <p className="mt-1 text-xs text-ink-muted dark:text-surface-muted">
                {t("settings.companionDesc")}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MASCOTS.map((key) => {
                const selected = settings.mascot === key;
                return (
                  <button
                    key={key}
                    onClick={() => setState(setMascot(state, key))}
                    aria-pressed={selected}
                    aria-label={t(`mascot.${key}`)}
                    title={t(`mascot.${key}`)}
                    className={`flex aspect-square items-center justify-center rounded-xl border p-1 transition-all
                      ${
                        selected
                          ? "border-sprout-400 bg-surface ring-2 ring-sprout-300 dark:border-sprout-600 dark:bg-surface-dark dark:ring-sprout-700"
                          : "border-transparent bg-surface/60 hover:bg-surface dark:bg-surface-dark/40 dark:hover:bg-surface-dark"
                      }`}
                  >
                    <img
                      src={`/sprout-${key}.png`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats snippet */}
          <div className="flex items-center gap-4 rounded-2xl border border-sprout-100 bg-surface p-4 dark:border-sprout-900 dark:bg-surface-dark-muted">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sprout-100 text-sprout-700 dark:bg-sprout-950 dark:text-sprout-300">
              <Leaf size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-subtle dark:text-surface-muted">
                {t("settings.daysTended")}
              </p>
              <p className="font-sans text-3xl font-bold text-ink dark:text-surface tabular-nums">
                {tended}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs uppercase tracking-wide text-ink-subtle dark:text-surface-muted">
                {t("streak.best")}
              </p>
              <p className="text-lg font-bold text-sprout-600 dark:text-sprout-400 tabular-nums">
                {streak.best}
                {t("unit.dayShort")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sprout-100 bg-surface p-5 dark:border-sprout-900 dark:bg-surface-dark-muted">
      <div className="mb-4 flex items-start gap-2">
        <span className="mt-0.5 text-ink-subtle dark:text-surface-muted">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold text-ink dark:text-surface">
            {title}
          </h2>
          {desc && (
            <p className="text-xs text-ink-subtle dark:text-surface-muted">
              {desc}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({
  title,
  desc,
  control,
  children,
}: {
  title: string;
  desc?: string;
  control: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink dark:text-surface">
            {title}
          </p>
          {desc && (
            <p className="mt-0.5 max-w-sm text-xs text-ink-muted dark:text-surface-muted">
              {desc}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">{control}</div>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-300 ${
        checked ? "bg-sprout-500" : "bg-surface-muted dark:bg-surface-dark-muted"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-300 dark:bg-surface-muted ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ThemeChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
        active
          ? "bg-surface text-sprout-700 shadow-sm dark:bg-surface-dark-muted dark:text-sprout-300"
          : "text-ink-subtle dark:text-surface-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
