import type { CSSProperties } from "react";
import { StreakInfo } from "../lib/status";
import { useCountUp } from "../lib/useCountUp";
import { useT } from "../lib/i18n";

type Props = {
  streak: StreakInfo;
  /** True when today's tasks aren't all done yet — shows the chain nudge. */
  todayPending?: boolean;
};

const MILESTONES = [1, 3, 7, 15, 21, 30, 100, 365];
const STREAK_ART = [
  { min: 21, src: "/sprout-streak-21.png" },
  { min: 15, src: "/sprout-streak-15.png" },
  { min: 7, src: "/sprout-streak-7.png" },
  { min: 3, src: "/sprout-streak-3.png" },
  { min: 1, src: "/sprout-streak-1.png" },
];

function nextMilestone(current: number): number | null {
  return MILESTONES.find((m) => m > current) ?? null;
}

function milestoneReached(current: number): number | null {
  return MILESTONES.includes(current) ? current : null;
}

function streakArt(current: number): string {
  return STREAK_ART.find((art) => current >= art.min)?.src ?? STREAK_ART[4].src;
}

export default function StreakCard({ streak, todayPending }: Props) {
  const { t } = useT();
  const current = useCountUp(streak.current);
  const best = useCountUp(streak.best);
  // Flame intensity ramps with streak, saturating around 30 days.
  const intensity = Math.min(streak.current / 30, 1);
  const reached = milestoneReached(streak.current);
  const next = nextMilestone(streak.current);
  const artSrc = streakArt(streak.current);

  return (
    <div
      className="motion-card bg-surface dark:bg-surface-dark-muted rounded-2xl p-4 border border-sprout-100 dark:border-sprout-950 flex flex-col gap-3"
      style={
        { "--streak-glow": intensity } as CSSProperties & {
          "--streak-glow": number;
        }
      }
    >
      <div className="flex items-center gap-4">
        <div
          className={`streak-mascot w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center ${
            streak.current > 0 ? "" : "opacity-45 grayscale"
          }`}
        >
          <img
            src={artSrc}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain"
            decoding="async"
          />
        </div>

        <div className="flex-1">
          <p className="text-xs text-ink-subtle dark:text-surface-muted uppercase tracking-wide font-medium">
            {t("streak.current")}
          </p>
          <p className="text-3xl font-bold font-sans text-ink dark:text-surface tabular-nums">
            {current}{" "}
            <span className="text-sm font-normal font-sans text-ink-subtle dark:text-surface-muted">
              {t(streak.current === 1 ? "streak.day" : "streak.days")}
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-ink-subtle dark:text-surface-muted uppercase tracking-wide font-medium">
            {t("streak.best")}
          </p>
          <p className="text-lg font-bold text-sprout-600 dark:text-sprout-400 tabular-nums">
            {best}
            {t("unit.dayShort")}
          </p>
        </div>
      </div>

      {/* Milestone banner */}
      {reached && (
        <div className="rounded-xl bg-sprout-50 dark:bg-sprout-950 px-3 py-2 text-sm text-sprout-700 dark:text-sprout-300 font-medium animate-bloom">
          <span aria-hidden="true">🎉</span>{" "}
          {t("streak.milestone", { n: reached })}
        </div>
      )}

      {/* Chain nudge */}
      {!reached && todayPending && streak.current > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950 px-3 py-2 text-sm text-amber-800 dark:text-amber-200 font-medium">
          {t("streak.chain", { n: streak.current })}
        </div>
      )}

      {/* Progress to next milestone */}
      {!reached && next && streak.current > 0 && (
        <div className="flex items-center gap-2 text-xs text-ink-subtle dark:text-surface-muted">
          <div className="flex-1 h-1.5 rounded-full bg-surface-muted dark:bg-surface-dark-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-sprout-500 transition-all duration-700"
              style={{ width: `${(streak.current / next) * 100}%` }}
            />
          </div>
          <span className="tabular-nums">
            {t("streak.toNext", { n: next - streak.current, m: next })}
          </span>
        </div>
      )}
    </div>
  );
}
