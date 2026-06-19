import { useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { useInstallPrompt } from "../lib/useInstallPrompt";
import { useT } from "../lib/i18n";

/**
 * Add-to-Home-Screen affordance. Renders only on handheld devices that aren't
 * already installed. Uses the native prompt where available (Android/Chromium),
 * and falls back to manual instructions on iOS Safari.
 */
export default function InstallButton() {
  const { t } = useT();
  const { canShow, canPrompt, isIOS, promptInstall } = useInstallPrompt();
  const [showIOS, setShowIOS] = useState(false);

  if (!canShow) return null;

  function handleClick() {
    if (canPrompt) {
      void promptInstall();
    } else if (isIOS) {
      setShowIOS(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sprout-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sprout-600/25 hover:bg-sprout-700"
      >
        <Download size={16} aria-hidden="true" />
        {t("install.cta")}
      </button>

      {showIOS && (
        <div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setShowIOS(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("install.iosTitle")}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl dark:bg-surface-dark-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/sprout-logo.png"
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-11 object-contain"
                />
                <h2 className="text-base font-bold text-ink dark:text-surface">
                  {t("install.iosTitle")}
                </h2>
              </div>
              <button
                onClick={() => setShowIOS(false)}
                aria-label={t("common.close")}
                className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full text-ink-subtle hover:text-ink dark:hover:text-surface"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ol className="flex flex-col gap-3 text-sm text-ink-muted dark:text-surface-muted">
              <Step n={1} icon={<Share size={16} aria-hidden="true" />}>
                {t("install.iosStep1")}
              </Step>
              <Step n={2} icon={<Plus size={16} aria-hidden="true" />}>
                {t("install.iosStep2")}
              </Step>
              <Step n={3}>{t("install.iosStep3")}</Step>
            </ol>
            <button
              onClick={() => setShowIOS(false)}
              className="mt-5 w-full rounded-2xl bg-sprout-600 py-3 text-sm font-semibold text-white hover:bg-sprout-700"
            >
              {t("install.dismiss")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sprout-100 text-xs font-bold text-sprout-700 dark:bg-sprout-950 dark:text-sprout-300">
        {n}
      </span>
      <span className="flex items-center gap-1.5">
        {children}
        {icon && (
          <span className="text-sprout-600 dark:text-sprout-400">{icon}</span>
        )}
      </span>
    </li>
  );
}
