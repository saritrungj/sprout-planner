import { useEffect } from "react";
import { Github, HeartHandshake, MessageCircle } from "lucide-react";
import { I18nProvider, useT } from "../lib/i18n";
import { Lang } from "../lib/store";
import LanguageSelect from "../components/LanguageSelect";
import { MODULES, type Module } from "./modules";
import { useLandingLang } from "./useLandingLang";

/** The signature sprout ease — exponential ease-out, never bouncy (DESIGN.md). */
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Solid green CTA that lifts on hover and presses in on click. */
const CTA_PRIMARY = `rounded-2xl bg-sprout-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-sprout-600/25 transition-all duration-200 ${EASE} hover:-translate-y-0.5 hover:bg-sprout-700 hover:shadow-lg hover:shadow-sprout-600/30 active:translate-y-0 active:scale-[0.97]`;

/** Soft secondary CTA with the same lift, quieter surface. */
const CTA_SOFT = `rounded-2xl bg-surface-muted px-6 py-3 text-sm font-semibold text-sprout-700 ring-1 ring-inset ring-sprout-100 transition-all duration-200 ${EASE} hover:-translate-y-0.5 hover:bg-sprout-50 hover:ring-sprout-200 active:translate-y-0 active:scale-[0.97]`;
const GITHUB_URL = "https://github.com/saritrungj/sprout-planner";
const FACEBOOK_URL = "https://www.facebook.com/saritrungj27/";

/**
 * Sprout Universe — the public marketing landing page.
 *
 * Reuses the Sprout Planner "Living Terrarium" design system: one sprout-green
 * family on tinted neutrals, 16px control / 24px sheet radii, flat-at-rest with
 * a soft lift on interaction, and the translucent jelly-sprout mascots as the
 * brand imagery. Light-mode first; all motion degrades via the global
 * prefers-reduced-motion rule in index.css. Fully localized (EN/TH/中文) — the
 * language choice is shared with the Planner module.
 */
export default function Landing() {
  const [lang, setLang] = useLandingLang();
  return (
    <I18nProvider lang={lang} titleKey="landing.docTitle">
      <LandingContent lang={lang} onChangeLang={setLang} />
    </I18nProvider>
  );
}

function LandingContent({
  lang,
  onChangeLang,
}: {
  lang: Lang;
  onChangeLang: (l: Lang) => void;
}) {
  const { t } = useT();

  // The planner shell locks the body (overflow:hidden, fixed height). The
  // landing page is a long scroll, so opt this document back into normal flow.
  useEffect(() => {
    const { documentElement: html, body } = document;
    const prev = {
      htmlH: html.style.height,
      bodyH: body.style.height,
      bodyO: body.style.overflow,
    };
    html.style.height = "auto";
    body.style.height = "auto";
    body.style.overflow = "visible";
    return () => {
      html.style.height = prev.htmlH;
      body.style.height = prev.bodyH;
      body.style.overflow = prev.bodyO;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <a href="#modules" className="sr-only">
        {t("landing.skipToModules")}
      </a>

      <TopBar lang={lang} onChangeLang={onChangeLang} />
      <Hero />
      <Modules />
      <Pricing />
      <Support />
      <Footer />
    </div>
  );
}

/* ── Wordmark ───────────────────────────────────────────────────────── */
function Wordmark({ className = "" }: { className?: string }) {
  const { t } = useT();
  return (
    <a
      href="/"
      className={`flex items-center gap-2.5 rounded-2xl px-1 py-1 ${className}`}
      aria-label={t("nav.universeHome")}
    >
      <img
        src="/sprout-logo.png"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 object-contain"
      />
      <span className="whitespace-nowrap font-sans text-base font-bold leading-none text-sprout-700 sm:text-lg">
        Sprout{" "}
        <span className="hidden font-medium text-ink-muted min-[400px]:inline">
          Universe
        </span>
      </span>
    </a>
  );
}

/* ── Top bar ────────────────────────────────────────────────────────── */
function TopBar({
  lang,
  onChangeLang,
}: {
  lang: Lang;
  onChangeLang: (l: Lang) => void;
}) {
  const { t } = useT();
  return (
    <header className="sticky top-0 z-30 border-b border-sprout-100/70 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8">
        <Wordmark />
        <nav
          aria-label={t("landing.nav.modules")}
          className="hidden items-center gap-1 md:flex"
        >
          <a
            href="#modules"
            className={`relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-semibold text-ink-muted transition-colors ${EASE} after:absolute after:bottom-2 after:left-4 after:h-0.5 after:w-0 after:rounded-full after:bg-sprout-400 after:transition-all after:duration-300 hover:text-sprout-700 hover:after:w-[calc(100%-2rem)]`}
          >
            {t("landing.nav.modules")}
          </a>
          <a
            href="#support"
            className={`relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-semibold text-ink-muted transition-colors ${EASE} after:absolute after:bottom-2 after:left-4 after:h-0.5 after:w-0 after:rounded-full after:bg-sprout-400 after:transition-all after:duration-300 hover:text-sprout-700 hover:after:w-[calc(100%-2rem)]`}
          >
            {t("landing.nav.support")}
          </a>
          <a
            href="#pricing"
            className={`relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-semibold text-ink-muted transition-colors ${EASE} after:absolute after:bottom-2 after:left-4 after:h-0.5 after:w-0 after:rounded-full after:bg-sprout-400 after:transition-all after:duration-300 hover:text-sprout-700 hover:after:w-[calc(100%-2rem)]`}
          >
            {t("landing.nav.pricing")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelect value={lang} onChange={onChangeLang} />
          <a
            href="/app/"
            className={`hidden min-h-[44px] items-center justify-center rounded-full bg-sprout-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sprout-600/25 transition-all duration-200 min-[440px]:inline-flex ${EASE} hover:-translate-y-0.5 hover:bg-sprout-700 hover:shadow-md hover:shadow-sprout-600/30 active:translate-y-0 active:scale-[0.97]`}
          >
            {t("landing.cta.openPlanner")}
          </a>
        </div>
      </div>
    </header>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */
function Hero() {
  const { t } = useT();
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* The "growth fill" — a soft green rise from the floor, echoing the
          planner's progression hero. Decorative, transform-free, paint-only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-sprout-100/70 via-sprout-50/40 to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <div
          className="animate-rise mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-sprout-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sprout-700 ring-1 ring-inset ring-sprout-100">
            <span className="h-1.5 w-1.5 rounded-full bg-sprout-500 motion-safe:animate-pulse" />
            {t("landing.hero.eyebrow")}
          </p>
          <h1 className="max-w-xl text-balance font-display text-[clamp(2.25rem,6.5vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            {t("landing.hero.titleLead")}
            <span className="text-sprout-600">
              {t("landing.hero.titleAccent")}
            </span>
            {t("landing.hero.titleTrail")}
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-ink-muted">
            {t("landing.hero.body")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a href="/app/" className={CTA_PRIMARY}>
              {t("landing.cta.openPlannerLong")}
            </a>
            <a href="#modules" className={CTA_SOFT}>
              {t("landing.cta.seeModules")}
            </a>
          </div>
        </div>

        {/* Mascot — the emotional core, floating over its diffuse glow. */}
        <div
          className="animate-rise flex justify-center lg:justify-end"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <div className="group relative">
            <div
              aria-hidden="true"
              className={`absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sprout-200/40 blur-3xl transition-all duration-700 ${EASE} group-hover:scale-125 group-hover:bg-sprout-300/40`}
            />
            {/* Scale lives on this wrapper; the img owns the float keyframe so
                the two transforms never fight. */}
            <div
              className={`transition-transform duration-500 ${EASE} group-hover:-translate-y-1.5 group-hover:scale-[1.06]`}
            >
              <img
                src="/sprout-success.png"
                alt={t("landing.hero.eyebrow")}
                className="h-56 w-56 select-none object-contain sm:h-72 sm:w-72"
                style={{
                  animation: "streak-float 5s ease-in-out infinite",
                  filter: "drop-shadow(0 18px 30px rgba(22,101,52,0.18))",
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Modules ────────────────────────────────────────────────────────── */
function Modules() {
  const { t } = useT();
  const live = MODULES.filter((m) => m.status === "live");
  const soon = MODULES.filter((m) => m.status === "soon");

  return (
    <section
      id="modules"
      className="flex min-h-[100svh] scroll-mt-16 flex-col justify-center px-5 py-20 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("landing.modules.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-ink-muted">
            {t("landing.modules.body")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {live.map((m) => (
            <FeaturedCard key={m.id} module={m} />
          ))}
        </div>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {soon.map((m, i) => (
            <SoonCard key={m.id} module={m} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedCard({ module: m }: { module: Module }) {
  const { t } = useT();
  return (
    <article
      className={`group grid items-center gap-5 overflow-hidden rounded-3xl border border-sprout-100 bg-surface p-6 text-center transition-all duration-500 lg:text-left ${EASE} hover:border-sprout-200 hover:shadow-[0_24px_60px_-12px_rgba(22,101,52,0.18)]`}
    >
      <div className="relative order-last flex justify-center lg:order-first">
        <div
          aria-hidden="true"
          className={`absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sprout-100/70 blur-2xl transition-all duration-700 ${EASE} group-hover:scale-125 group-hover:bg-sprout-200/70`}
        />
        <img
          src={m.mascot}
          alt={`Sprout ${m.name}`}
          className={`h-44 w-44 select-none object-contain transition-transform duration-500 ${EASE} group-hover:-translate-y-2 group-hover:rotate-2 group-hover:scale-105 sm:h-52 sm:w-52`}
          draggable={false}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
            Sprout {m.name}
          </h3>
          <span className="rounded-full bg-sprout-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {t("landing.badge.available")}
          </span>
        </div>
        <p className="mt-3 text-lg font-semibold text-sprout-700">
          {t(`landing.module.${m.id}.blurb`)}
        </p>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-ink-muted lg:mx-0">
          {t(`landing.module.${m.id}.detail`)}
        </p>
        <a
          href={m.href}
          className={`group/cta mt-6 inline-flex items-center gap-2 ${CTA_PRIMARY}`}
        >
          {t("landing.cta.openModule", { name: m.name })}
          <span
            aria-hidden="true"
            className={`transition-transform duration-200 ${EASE} group-hover/cta:translate-x-1`}
          >
            →
          </span>
        </a>
      </div>
    </article>
  );
}

function Pricing() {
  const { t } = useT();
  return (
    <section
      id="pricing"
      className="flex min-h-[100svh] scroll-mt-16 flex-col justify-center px-5 py-20 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-ink-muted">
            {t("landing.pricing.body")}
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <PricingPanel
            title={t("landing.pricing.free")}
            price={t("landing.pricing.freePrice")}
            mascot="/sprout-success.png"
            items={t("landing.pricing.freeItems")}
            active
          />
          <PricingPanel
            title={t("landing.pricing.future")}
            price={t("landing.badge.soon")}
            mascot="/sprout-streak.png"
            items={t("landing.pricing.futureItems")}
          />
        </div>
      </div>
    </section>
  );
}

function PricingPanel({
  title,
  price,
  mascot,
  items,
  active = false,
}: {
  title: string;
  price: string;
  mascot: string;
  items: string;
  active?: boolean;
}) {
  return (
    <article
      className={`rounded-3xl border p-6 text-center lg:text-left ${
        active
          ? "border-sprout-300 bg-sprout-50"
          : "border-sprout-100 bg-surface"
      }`}
    >
      <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
          <p className="mt-2 text-4xl font-bold tabular-nums text-sprout-700">
            {price}
          </p>
        </div>
        <img src={mascot} alt="" aria-hidden="true" className="h-20 w-20 object-contain" />
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink-muted">{items}</p>
    </article>
  );
}

function SoonCard({ module: m, index }: { module: Module; index: number }) {
  const { t } = useT();
  return (
    <li
      className={`animate-rise group flex flex-col items-center rounded-2xl border border-sprout-100 bg-surface p-6 text-center transition-all duration-300 lg:items-stretch lg:text-left ${EASE} hover:-translate-y-1 hover:border-sprout-200 hover:shadow-[0_18px_40px_-8px_rgba(22,101,52,0.16)]`}
      style={{ "--i": index + 2 } as React.CSSProperties}
    >
      <div className="mb-4 flex w-full items-start justify-between">
        <img
          src={m.mascot}
          alt={`Sprout ${m.name}`}
          className={`h-16 w-16 select-none object-contain opacity-90 transition-all duration-300 ${EASE} group-hover:-translate-y-1 group-hover:rotate-[-4deg] group-hover:scale-110 group-hover:opacity-100`}
          draggable={false}
        />
        <span className="rounded-full bg-sprout-50 px-2.5 py-1 text-xs font-semibold text-sprout-700 ring-1 ring-inset ring-sprout-100">
          {t("landing.badge.soon")}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-ink">
        Sprout {m.name}
      </h3>
      <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-muted">
        {t(`landing.module.${m.id}.blurb`)}
      </p>
      <div className="mt-auto flex w-full items-center justify-center gap-2 pt-4 lg:justify-between">
        {m.eta && (
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-subtle">
            {t(`landing.eta.${m.eta}`)}
          </span>
        )}
        {m.channel === "line" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sprout-50 px-2.5 py-1 text-xs font-semibold text-sprout-700 ring-1 ring-inset ring-sprout-100">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-sprout-500"
            />
            {t("landing.channel.line")}
          </span>
        )}
      </div>
    </li>
  );
}

/* ── Ethos ──────────────────────────────────────────────────────────── */
function Support() {
  const { t } = useT();
  return (
    <section
      id="support"
      className="flex min-h-[100svh] scroll-mt-16 flex-col justify-center bg-sprout-50/60 px-5 py-20 sm:px-8"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sprout-700 ring-1 ring-inset ring-sprout-100">
            <HeartHandshake size={14} aria-hidden="true" />
            {t("landing.support.eyebrow")}
          </p>
          <h2 className="max-w-xl text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("landing.support.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted">
            {t("landing.support.body")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 ${CTA_PRIMARY}`}
            >
              <Github size={17} aria-hidden="true" />
              {t("landing.support.github")}
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 ${CTA_SOFT}`}
            >
              <MessageCircle size={17} aria-hidden="true" />
              {t("landing.support.facebook")}
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-sprout-100 bg-surface p-6 shadow-[0_24px_60px_-24px_rgba(22,101,52,0.25)]">
          <img
            src="/sprout-read.png"
            alt=""
            aria-hidden="true"
            className="mx-auto h-40 w-40 object-contain"
            style={{ animation: "streak-float 5s ease-in-out infinite" }}
          />
          <p className="mt-4 text-center text-sm font-semibold leading-relaxed text-ink-muted">
            {t("landing.support.note")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-sprout-100 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 text-center lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <Wordmark className="lg:-ml-1" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-subtle">
            {t("landing.footer.tagline")}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-sm text-ink-muted lg:items-end">
          <a
            href="/app/"
            className="group inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-sprout-700 transition-colors hover:text-sprout-600"
          >
            {t("landing.cta.openPlannerLong")}
            <span
              aria-hidden="true"
              className={`transition-transform duration-200 ${EASE} group-hover:translate-x-1`}
            >
              →
            </span>
          </a>
          <p className="text-ink-subtle">
            {t("landing.footer.copyright", {
              year: new Date().getFullYear(),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
