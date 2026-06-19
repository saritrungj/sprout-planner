import { Reminders } from "../lib/store";
import { useReminders } from "../lib/useReminders";
import { useT } from "../lib/i18n";

/** Headless: schedules the daily reminder while the app is open. */
export default function RemindersRunner({
  reminders,
}: {
  reminders: Reminders;
}) {
  const { t } = useT();
  useReminders(reminders, t("reminder.body"));
  return null;
}
