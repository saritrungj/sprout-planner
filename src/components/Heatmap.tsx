import { HeatmapCell } from "../lib/status";
import { todayISO, weekdayLabels } from "../lib/dates";
import { useT } from "../lib/i18n";

type Props = { cells: HeatmapCell[] };

function cellColor(cell: HeatmapCell): string {
  const today = todayISO();
  if (cell.date > today) return "bg-surface-muted dark:bg-surface-dark-muted";
  if (cell.status === "neutral") return "bg-surface-muted dark:bg-surface-dark-muted";
  if (cell.status === "missed") return "bg-red-200 dark:bg-red-900";
  if (cell.ratio === 0) return "bg-surface-muted dark:bg-surface-dark-muted";
  if (cell.ratio < 0.34) return "bg-sprout-200 dark:bg-sprout-900";
  if (cell.ratio < 0.67) return "bg-sprout-400 dark:bg-sprout-700";
  if (cell.ratio < 1) return "bg-sprout-500 dark:bg-sprout-600";
  return "bg-sprout-600 dark:bg-sprout-500";
}

export default function Heatmap({ cells }: Props) {
  const { t, locale } = useT();
  const narrow = weekdayLabels(locale, "narrow");
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels: { col: number; label: string }[] = [];
  weeks.forEach((week, wi) => {
    const first = week.find((c) => c.date.slice(8) === "01");
    if (first) {
      monthLabels.push({
        col: wi,
        label: new Date(first.date + "T00:00:00").toLocaleDateString(locale, {
          month: "short",
        }),
      });
    }
  });

  return (
    <div
      className="bg-surface dark:bg-surface-dark-muted rounded-2xl p-4 border border-sprout-100 dark:border-sprout-950"
      aria-label={t("dash.activity")}
    >
      <h3 className="text-xs text-ink-subtle dark:text-surface-muted uppercase tracking-wide font-medium mb-3">
        {t("dash.activity")}
      </h3>

      <div className="relative" style={{ paddingLeft: "28px" }}>
        {/* Month labels */}
        <div
          className="flex gap-[3px] mb-1 text-xs text-ink-subtle dark:text-surface-muted"
          style={{ height: "14px" }}
          aria-hidden="true"
        >
          {weeks.map((_week, wi) => {
            const ml = monthLabels.find((m) => m.col === wi);
            return (
              <div key={wi} style={{ width: "12px", flexShrink: 0 }}>
                {ml && <span className="text-[10px]">{ml.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Day-of-week labels + grid */}
        <div className="flex gap-1" aria-hidden="true">
          <div
            className="flex flex-col gap-[3px] mr-1 text-[9px] text-ink-subtle dark:text-surface-muted"
            style={{ width: "20px" }}
          >
            {["", narrow[1], "", narrow[3], "", narrow[5], ""].map((d, i) => (
              <div key={i} style={{ height: "12px", lineHeight: "12px" }}>
                {d}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={`${cell.date}: ${Math.round(cell.ratio * 100)}%`}
                    className={`w-3 h-3 rounded-[2px] ${cellColor(cell)} transition-colors`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-1 mt-3 justify-end text-[10px] text-ink-subtle dark:text-surface-muted"
        aria-hidden="true"
      >
        <span>{t("dash.less")}</span>
        {[
          "bg-surface-muted dark:bg-surface-dark-muted",
          "bg-sprout-200 dark:bg-sprout-900",
          "bg-sprout-400 dark:bg-sprout-700",
          "bg-sprout-600 dark:bg-sprout-500",
        ].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span>{t("dash.more")}</span>
      </div>
    </div>
  );
}
