/**
 * The Sprout Universe module catalog that drives the landing-page grid.
 * Add an entry here when a new module is announced or ships; the grid and
 * status pills are fully data-driven. Display copy (blurb, detail, badges,
 * ETA, channel) is localized — see the `landing.module.*` keys in
 * src/lib/i18n.tsx.
 */

export type ModuleStatus = "live" | "soon";

export type Module = {
  /** Stable id; also the i18n namespace (landing.module.<id>.*). */
  id: "planner" | "focus" | "mood" | "together" | "finance";
  /** Brand name kept in Latin across languages — rendered as "Sprout {name}". */
  name: string;
  status: ModuleStatus;
  /** Where the primary CTA points (live modules only). */
  href?: string;
  /** Transparent jelly-sprout mascot PNG from /public, posed for the module. */
  mascot: string;
  /** ETA bucket for soon modules → landing.eta.<eta> label. */
  eta?: "next" | "later";
  /** Delivery channel pill, e.g. a LINE Official Account companion. */
  channel?: "line";
};

export const MODULES: Module[] = [
  {
    id: "planner",
    name: "Planner",
    status: "live",
    href: "/app/",
    mascot: "/sprout-success.png",
  },
  {
    id: "focus",
    name: "Focus",
    status: "live",
    href: "/app/#focus",
    mascot: "/sprout-work.png",
  },
  {
    id: "mood",
    name: "Mood",
    status: "live",
    href: "/app/#mood",
    mascot: "/sprout-mood.png",
  },
  {
    id: "together",
    name: "Together",
    status: "soon",
    mascot: "/sprout-together.png",
    eta: "next",
    channel: "line",
  },
  {
    id: "finance",
    name: "Finance",
    status: "soon",
    mascot: "/sprout-finance.png",
    eta: "next",
    channel: "line",
  },
];
