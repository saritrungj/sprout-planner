import { useEffect } from "react";
import { Reminders } from "./store";

export function notifSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notifPermission(): NotificationPermission {
  return notifSupported() ? Notification.permission : "denied";
}

export async function requestNotif(): Promise<NotificationPermission> {
  if (!notifSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** Milliseconds from now until the next occurrence of "HH:MM" (local). */
function msUntil(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(h || 0, m || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

async function fire(body: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg && "showNotification" in reg) {
      await reg.showNotification("Sprout", {
        body,
        icon: "/icon-192.png",
        badge: "/favicon-64.png",
        tag: "sprout-daily",
      });
    } else if (notifPermission() === "granted") {
      new Notification("Sprout", { body, icon: "/icon-192.png" });
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Foreground daily reminder. Schedules a one-shot timer to the next reminder
 * time and reschedules after firing. Only runs while a tab is open — a true
 * background reminder needs push infrastructure we don't have.
 */
export function useReminders(reminders: Reminders, body: string) {
  useEffect(() => {
    if (
      !reminders.enabled ||
      !notifSupported() ||
      Notification.permission !== "granted"
    ) {
      return;
    }
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        void fire(body);
        schedule();
      }, msUntil(reminders.time));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [reminders.enabled, reminders.time, body]);
}
