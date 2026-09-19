import { createError } from "../middlewares/errorHandler.js";

const careFields = {
  taco: { vermifuge: "vermifuge", antipuce: "antiPuce", vaccine: "annualVaccine" },
  nono: { vaccine: "vaccine" },
} as const;

// Dates are calendar days in the user's timezone, not UTC timestamps.
export const buildCareUpdate = (
  profile: keyof typeof careFields,
  care: string,
  intervalMonths: unknown,
  date?: unknown,
  current: Record<string, unknown> = {}
): Record<string, string | number> => {
  const fields: Record<string, string> = careFields[profile];
  if (!Object.hasOwn(fields, care)) {
    throw createError("Soin inconnu", 400);
  }
  if (typeof intervalMonths !== "number" || !Number.isInteger(intervalMonths) || intervalMonths < 1 || intervalMonths > 1200) {
    throw createError("L'intervalle doit être un nombre entier de 1 à 1200 mois", 400);
  }

  const prefix = fields[care];
  const update: Record<string, string | number> = { [`${prefix}IntervalMonths`]: intervalMonths };
  const applicationDate = date === undefined ? current[`${prefix}Date`] ?? "" : date;
  if (date !== undefined && typeof date === "string") update[`${prefix}Date`] = date;
  if (applicationDate === "") {
    update[`${prefix}Reminder`] = "";
    return update;
  }

  if (typeof applicationDate !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(applicationDate)) {
    throw createError("Date du soin invalide", 400);
  }
  const [day, month, year] = applicationDate.split("/").map(Number);
  const given = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || given.getUTCFullYear() !== year || given.getUTCMonth() !== month - 1 || given.getUTCDate() !== day) {
    throw createError("Date du soin invalide", 400);
  }

  // Clamp to the final day of the target month (31 January + 1 month = 28/29 February).
  const next = new Date(Date.UTC(year, month - 1 + intervalMonths, 1));
  const lastDay = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate();
  next.setUTCDate(Math.min(day, lastDay));
  if (next.getUTCFullYear() > 9999) throw createError("Prochaine échéance hors limites", 400);
  update[`${prefix}Reminder`] = `${String(next.getUTCDate()).padStart(2, "0")}/${String(next.getUTCMonth() + 1).padStart(2, "0")}/${next.getUTCFullYear()}`;
  return update;
};

// Keep the date endpoints in sync with the same formula used by the care button.
export const buildCareDateUpdate = (
  profile: keyof typeof careFields,
  field: string,
  date: string,
  current: Record<string, unknown>
): Record<string, string | number> => {
  const care = Object.entries(careFields[profile]).find(([, prefix]) => `${prefix}Date` === field);
  if (!care) return { [field]: date };
  const [key, prefix] = care;
  const interval = current[`${prefix}IntervalMonths`];
  if (interval === null || interval === undefined) {
    return { [field]: date, [`${prefix}Reminder`]: "" };
  }
  return buildCareUpdate(profile, key, interval, date);
};

// Reconcile old reminders on load, including reminders saved before automatic calculation.
export const getCareReminderUpdates = (
  profile: keyof typeof careFields,
  current: Record<string, unknown>
): Record<string, string | number> => {
  const updates: Record<string, string | number> = {};
  for (const [care, prefix] of Object.entries(careFields[profile])) {
    const interval = current[`${prefix}IntervalMonths`];
    if (interval === null || interval === undefined) continue;
    const reminderField = `${prefix}Reminder`;
    const computed = buildCareUpdate(profile, care, interval, undefined, current)[reminderField];
    if (current[reminderField] !== computed) updates[reminderField] = computed;
  }
  return updates;
};
