import { parseStoredDate, startOfDay } from "./dateUtils.ts";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Nono, ReminderPost, Taco } from "../types/index.ts";

export interface ScheduledReminder {
  id: number;
  title: string;
  body: string;
  at: Date;
}

const TACO_VERMIFUGE_ID = 101;
const TACO_ANTIPUCE_ID = 102;
const TACO_VACCINE_ID = 103;

const NONO_CHECKUP_ID = 201;
const NONO_VACCINE_ID = 202;
const NONO_VITAMIN_ID = 203;
const NONO_ADMIN_ID = 204;

const REMINDER_POST_ID_BASE = 10_000;
const REMINDER_POST_ID_RANGE = 500_000;

// Reserved for cancelling notifications from the removed calendar in older app versions.
const RETIRED_ID_BASE = 600_000;
const RETIRED_ID_RANGE = 500_000;

export const isTacoManagedId = (id: number): boolean => id >= 100 && id < 200;
export const isNonoManagedId = (id: number): boolean => id >= 200 && id < 300;
export const isReminderPostManagedId = (id: number): boolean =>
  id >= REMINDER_POST_ID_BASE && id < REMINDER_POST_ID_BASE + REMINDER_POST_ID_RANGE;
const isRetiredId = (id: number): boolean =>
  id >= RETIRED_ID_BASE && id < RETIRED_ID_BASE + RETIRED_ID_RANGE;

const hashNotificationId = (seed: string, base: number, range: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return base + (Math.abs(hash) % range);
};

const atTime = (date: Date, hour: number, minute: number): Date => {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
};

/**
 * Ne planifie que les rappels a venir (aujourd'hui ou plus tard) : les echeances
 * deja passees sont laissees a l'email quotidien pour eviter de renotifier a
 * chaque ouverture de l'appli.
 */
const buildUpcomingReminder = (
  id: number,
  dateString: string | null | undefined,
  title: string,
  body: string,
  hour: number,
  minute: number
): ScheduledReminder | null => {
  const parsedDate = parseStoredDate(dateString);

  if (!parsedDate || startOfDay(parsedDate).getTime() < startOfDay(new Date()).getTime()) {
    return null;
  }

  return { id, title, body, at: atTime(parsedDate, hour, minute) };
};

export const buildTacoReminders = (
  taco: Pick<Taco, "vermifugeReminder" | "antiPuceReminder" | "annualVaccineReminder">
): ScheduledReminder[] => {
  const reminders = [
    buildUpcomingReminder(
      TACO_VERMIFUGE_ID,
      taco.vermifugeReminder,
      "Vermifuge Coco",
      "Le rappel du vermifuge pour Coco arrive a echeance aujourd'hui.",
      8,
      0
    ),
    buildUpcomingReminder(
      TACO_ANTIPUCE_ID,
      taco.antiPuceReminder,
      "Anti-puce Coco",
      "Le rappel de l'anti-puce pour Coco arrive a echeance aujourd'hui.",
      8,
      0
    ),
    buildUpcomingReminder(
      TACO_VACCINE_ID,
      taco.annualVaccineReminder,
      "Vaccin annuel Coco",
      "Le rappel du vaccin annuel de Coco arrive a echeance aujourd'hui.",
      8,
      0
    ),
  ];

  return reminders.filter((reminder): reminder is ScheduledReminder => reminder !== null);
};

export const buildNonoReminders = (
  nono: Pick<Nono, "checkupReminder" | "vaccineReminder" | "vitaminReminder" | "administrativeReminder">
): ScheduledReminder[] => {
  const reminders = [
    buildUpcomingReminder(
      NONO_CHECKUP_ID,
      nono.checkupReminder,
      "Rendez-vous Nono",
      "Le rappel du prochain rendez-vous pour Nono arrive a echeance aujourd'hui.",
      8,
      15
    ),
    buildUpcomingReminder(
      NONO_VACCINE_ID,
      nono.vaccineReminder,
      "Vaccin Nono",
      "Le rappel du prochain vaccin de Nono arrive a echeance aujourd'hui.",
      8,
      15
    ),
    buildUpcomingReminder(
      NONO_VITAMIN_ID,
      nono.vitaminReminder,
      "Vitamine Nono",
      "Le rappel vitamine de Nono arrive a echeance aujourd'hui.",
      8,
      15
    ),
    buildUpcomingReminder(
      NONO_ADMIN_ID,
      nono.administrativeReminder,
      "Demarche Nono",
      "Le rappel pour une demarche ou une relance de Nono arrive a echeance aujourd'hui.",
      8,
      15
    ),
  ];

  return reminders.filter((reminder): reminder is ScheduledReminder => reminder !== null);
};

const parseDueTime = (dueTime?: string | null): { hour: number; minute: number } | null => {
  if (!dueTime) {
    return null;
  }

  const [hourStr, minuteStr] = dueTime.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return { hour, minute };
};

/**
 * Les taches n'ont qu'une date par defaut (notif le matin de l'echeance, comme l'email).
 * Si une heure precise est renseignee, on bascule sur une notif 30 min avant.
 */
export const buildReminderPostReminders = (posts: ReminderPost[]): ScheduledReminder[] => {
  const now = new Date();

  const reminders = posts.map((post) => {
    if (post.status === "done" || post.amount == null || !post.dueDate) {
      return null;
    }

    const dueDate = new Date(post.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return null;
    }

    const id = hashNotificationId(post._id, REMINDER_POST_ID_BASE, REMINDER_POST_ID_RANGE);
    const amountLabel = typeof post.amount === "number" ? `${post.amount.toFixed(2)} €` : "";
    const dueTime = parseDueTime(post.dueTime);

    if (dueTime) {
      const notifyAt = new Date(atTime(dueDate, dueTime.hour, dueTime.minute).getTime() - 30 * 60 * 1000);

      if (notifyAt.getTime() < now.getTime()) {
        return null;
      }

      return {
        id,
        title: `Dans 30 min : ${post.title}`,
        body: [
          `"${post.title}"${amountLabel ? ` (${amountLabel})` : ""} a ${post.dueTime}.`,
          post.body ? `Notes : ${post.body}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        at: notifyAt,
      };
    }

    if (startOfDay(dueDate).getTime() < startOfDay(now).getTime()) {
      return null;
    }

    return {
      id,
      title: `Echeance : ${post.title}`,
      body: [
        `Le rappel "${post.title}"${amountLabel ? ` (${amountLabel})` : ""} arrive a echeance aujourd'hui.`,
        post.body ? `Notes : ${post.body}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      at: atTime(dueDate, 8, 0),
    };
  });

  return reminders.filter((reminder): reminder is ScheduledReminder => reminder !== null);
};

const isAnyManagedId = (id: number): boolean =>
  isTacoManagedId(id) || isNonoManagedId(id) || isReminderPostManagedId(id) || isRetiredId(id);

/**
 * Annule tous les rappels geres par l'appli (Coco, Nono, taches et anciennes versions), sans en
 * reprogrammer. Utilise quand l'utilisateur desactive les notifications sur son profil.
 */
const cancelManagedReminders = async (matchesId: (id: number) => boolean): Promise<void> => {
  const pending = await LocalNotifications.getPending();
  const toCancel = pending.notifications.filter((n) => matchesId(n.id)).map((n) => ({ id: n.id }));

  if (toCancel.length > 0) {
    await LocalNotifications.cancel({ notifications: toCancel });
  }
};

export const cancelAllManagedReminders = (): Promise<void> => cancelManagedReminders(isAnyManagedId);
export const cancelRetiredReminders = (): Promise<void> => cancelManagedReminders(isRetiredId);

export const requestNotificationPermission = async (): Promise<boolean> => {
  const status = await LocalNotifications.checkPermissions();

  if (status.display === "granted") {
    return true;
  }

  const requested = await LocalNotifications.requestPermissions();
  return requested.display === "granted";
};

/**
 * Annule les notifications en attente qui appartiennent au groupe gere (identifie
 * par isManagedId), puis replanifie la liste fournie. Cela nettoie automatiquement
 * les rappels supprimes/termines/dates puisqu'on ne les retrouve pas dans `reminders`.
 */
export const rescheduleReminders = async (
  reminders: ScheduledReminder[],
  isManagedId: (id: number) => boolean
): Promise<void> => {
  const granted = await requestNotificationPermission();

  if (!granted) {
    return;
  }

  await cancelManagedReminders(isManagedId);

  if (reminders.length === 0) {
    return;
  }

  await LocalNotifications.schedule({
    notifications: reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      body: reminder.body,
      schedule: { at: reminder.at, allowWhileIdle: true },
    })),
  });
};
