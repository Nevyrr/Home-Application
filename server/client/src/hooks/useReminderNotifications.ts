import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getTacoData } from "../controllers/TacoController.ts";
import { getNonoData } from "../controllers/NonoController.ts";
import { getPosts } from "../controllers/ReminderPostsController.ts";
import {
  buildNonoReminders,
  buildReminderPostReminders,
  buildTacoReminders,
  cancelAllManagedReminders,
  cancelRetiredReminders,
  isNonoManagedId,
  isReminderPostManagedId,
  isTacoManagedId,
  rescheduleReminders,
} from "../utils/localNotifications.ts";

/**
 * Reprogramme les notifications locales (vermifuge/anti-puce/vaccins/rappels) a chaque ouverture de l'appli native, tant que l'utilisateur n'a pas
 * desactive les notifications sur son profil (`enabled` = connecte ET case cochee).
 */
export const useReminderNotifications = (enabled: boolean): void => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (!enabled) {
      // Desactive (deconnecte ou case decochee) : on annule ce qui etait deja programme.
      void cancelAllManagedReminders().catch(() => undefined);
      return;
    }

    let cancelled = false;

    const syncNotifications = async () => {
      try {
        await cancelRetiredReminders();
        const [taco, nono, { posts }] = await Promise.all([
          getTacoData(),
          getNonoData(),
          getPosts(),
        ]);

        if (cancelled) {
          return;
        }

        await rescheduleReminders(buildTacoReminders(taco), isTacoManagedId);
        await rescheduleReminders(buildNonoReminders(nono), isNonoManagedId);
        await rescheduleReminders(buildReminderPostReminders(posts), isReminderPostManagedId);
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
