import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getTacoData } from "../controllers/TacoController.ts";
import { getNonoData } from "../controllers/NonoController.ts";
import { getPosts } from "../controllers/ReminderPostsController.ts";
import { getEvents } from "../controllers/CalendarEventsController.ts";
import {
  buildCalendarEventReminders,
  buildNonoReminders,
  buildReminderPostReminders,
  buildTacoReminders,
  isCalendarEventManagedId,
  isNonoManagedId,
  isReminderPostManagedId,
  isTacoManagedId,
  rescheduleReminders,
} from "../utils/localNotifications.ts";

/**
 * Reprogramme les notifications locales (vermifuge/anti-puce/vaccins/rappels/evenements
 * du planning) a chaque ouverture de l'appli native.
 */
export const useReminderNotifications = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled || !Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;

    const syncNotifications = async () => {
      try {
        const [taco, nono, { posts }, { events }] = await Promise.all([
          getTacoData(),
          getNonoData(),
          getPosts(),
          getEvents(),
        ]);

        if (cancelled) {
          return;
        }

        await rescheduleReminders(buildTacoReminders(taco), isTacoManagedId);
        await rescheduleReminders(buildNonoReminders(nono), isNonoManagedId);
        await rescheduleReminders(buildReminderPostReminders(posts), isReminderPostManagedId);
        await rescheduleReminders(buildCalendarEventReminders(events), isCalendarEventManagedId);
      } catch {
        // Silencieux : la synchro reessaiera a la prochaine ouverture de l'appli.
      }
    };

    void syncNotifications();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
};
