import { buildCareUpdate, buildCareDateUpdate, getCareReminderUpdates } from "../utils/careSchedule.js";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import cron from "node-cron";
import NonoModel from "../models/NonoModel.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { sendReminderEmails } from "../utils/reminderEmails.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

type NonoField =
  | "birthDate"
  | "checkupDate"
  | "vaccineDate"
  | "vaccineReminder"
  | "notes";

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";

const EMPTY_NONO_DATA = {
  birthDate: DEFAULT_NONO_BIRTH_DATE,
  checkupDate: "",
  vaccineDate: "",
  vaccineReminder: "",
  notes: "",
  bottleEntries: [],
  weightEntries: [],
};

const parseStoredDate = (dateString: string): Date | null => {
  if (!dateString) {
    return null;
  }

  const [day, month, year] = dateString.split("/");

  if (!day || !month || !year) {
    return null;
  }

  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

cron.schedule("15 8 * * *", async () => {
  try {
    const nono = await NonoModel.findOne();

    if (!nono) {
      return;
    }

    const currentDate = startOfDay(new Date());
    const reminders = [
      {
        date: nono.vaccineReminder,
        subject: "rappel vaccin nono",
        message: "Le rappel du prochain vaccin de Nono est dépassé. Pensez a verifier la date avec votre professionnel de sante.",
      },
    ];

    for (const reminder of reminders) {
      const reminderDate = parseStoredDate(reminder.date);

      if (reminderDate && reminderDate.getTime() <= currentDate.getTime()) {
        await sendReminderEmails(reminder.subject, reminder.message);
      }
    }
  } catch (error) {
    logger.error("Echec du job cron des rappels Nono", { error });
  }
}, { timezone: env.REMINDER_TIME_ZONE });

const getOrCreateNono = async () => {
  const existingNono = await NonoModel.findOne();

  if (existingNono) {
    let shouldSave = false;

    if (!existingNono.birthDate) {
      existingNono.birthDate = DEFAULT_NONO_BIRTH_DATE;
      shouldSave = true;
    }

    if (!Array.isArray(existingNono.bottleEntries)) {
      existingNono.bottleEntries = [];
      shouldSave = true;
    }

    existingNono.bottleEntries.forEach((entry) => {
      const normalizedDate = getBottleEntryDate(entry);

      if (normalizedDate && entry.date !== normalizedDate) {
        entry.date = normalizedDate;
        shouldSave = true;
      }
    });

    if (!Array.isArray(existingNono.weightEntries)) {
      existingNono.weightEntries = [];
      shouldSave = true;
    }

    if (shouldSave) {
      await existingNono.save();
    }

    return existingNono;
  }

  return NonoModel.create(EMPTY_NONO_DATA);
};

const readStringValue = (value: unknown, label: string): string => {
  if (typeof value !== "string") {
    throw createError(`${label} invalide`, 400);
  }

  return value.trim();
};

const toDateOnlyValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readDateOnlyValue = (value: unknown, label: string): string => {
  if (typeof value !== "string") {
    throw createError(`${label} invalide`, 400);
  }

  const trimmedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    throw createError(`${label} invalide`, 400);
  }

  const parsedDate = new Date(`${trimmedValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createError(`${label} invalide`, 400);
  }

  return trimmedValue;
};

const getBottleEntryDate = (entry: { date?: string; timestamp?: string }): string => {
  if (typeof entry.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.date.trim())) {
    return entry.date.trim();
  }

  if (typeof entry.timestamp === "string") {
    const parsedDate = new Date(entry.timestamp);

    if (!Number.isNaN(parsedDate.getTime())) {
      return toDateOnlyValue(parsedDate);
    }
  }

  return "";
};

const readPositiveNumber = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw createError(`${label} invalide`, 400);
  }

  return value;
};

const readObjectIdValue = (value: unknown, label: string): Types.ObjectId => {
  if (typeof value !== "string" || !Types.ObjectId.isValid(value)) {
    throw createError(`${label} invalide`, 400);
  }

  return new Types.ObjectId(value);
};

const updateNonoField = async (field: NonoField, value: string) => {
  const current = field.endsWith("Date") ? await NonoModel.findOne().lean() : null;
  const update = buildCareDateUpdate("nono", field, value, current || {});
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!updatedNono) {
    throw createError("Donnees Nono non trouvees", 404);
  }

  return updatedNono;
};

const appendBottleEntry = async (amountMl: number, date: string) => {
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    {
      $push: {
        bottleEntries: {
          $each: [{ amountMl, date, timestamp: new Date().toISOString() }],
          $sort: { date: -1, timestamp: -1 },
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!updatedNono) {
    throw createError("Donnees Nono non trouvees", 404);
  }

  return updatedNono;
};

const appendWeightEntry = async (date: string, weightKg: number) => {
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    {
      $push: {
        weightEntries: {
          $each: [{ date, weightKg }],
          $sort: { date: -1 },
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!updatedNono) {
    throw createError("Donnees Nono non trouvees", 404);
  }

  return updatedNono;
};

const removeBottleEntry = async (entryId: Types.ObjectId) => {
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    {
      $pull: {
        bottleEntries: {
          _id: entryId,
        },
      },
    },
    { new: true }
  );

  if (!updatedNono) {
    throw createError("Donnees Nono non trouvees", 404);
  }

  return updatedNono;
};

const removeWeightEntry = async (entryId: Types.ObjectId) => {
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    {
      $pull: {
        weightEntries: {
          _id: entryId,
        },
      },
    },
    { new: true }
  );

  if (!updatedNono) {
    throw createError("Donnees Nono non trouvees", 404);
  }

  return updatedNono;
};

const sendNonoUpdate = (res: Response, nono: Awaited<ReturnType<typeof updateNonoField>>, message: string): void => {
  sendSuccess(res, { nono: [nono] }, message);
};

const getNonoData = async (_req: Request, res: Response): Promise<void> => {
  let nono = await getOrCreateNono();
  const reminders = getCareReminderUpdates("nono", { ...nono.toObject() });
  if (Object.keys(reminders).length > 0) {
    nono = await NonoModel.findOneAndUpdate(
      { _id: nono._id }, { $set: reminders }, { new: true }
    ) || nono;
  }
  sendSuccess(res, { nono: [nono] }, "Donnees Nono recuperees avec succes");
};

const updateBirthDate = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("birthDate", readStringValue(req.body.date, "Date de naissance"));
  sendNonoUpdate(res, updatedNono, "Date de naissance mise a jour avec succes");
};

const updateCheckupDate = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("checkupDate", readStringValue(req.body.date, "Date de rendez-vous"));
  sendNonoUpdate(res, updatedNono, "Date du rendez-vous mise a jour avec succes");
};

const updateVaccineDate = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("vaccineDate", readStringValue(req.body.date, "Date du vaccin"));
  sendNonoUpdate(res, updatedNono, "Date du vaccin mise a jour avec succes");
};

const updateVaccineReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("vaccineReminder", readStringValue(req.body.date, "Rappel du vaccin"));
  sendNonoUpdate(res, updatedNono, "Rappel du vaccin mis a jour avec succes");
};

const updateNotes = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("notes", readStringValue(req.body.notes, "Pense-bete"));
  sendNonoUpdate(res, updatedNono, "Pense-bete mis a jour avec succes");
};

const addBottleEntry = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await appendBottleEntry(
    readPositiveNumber(req.body.amountMl, "Quantite du biberon"),
    readDateOnlyValue(req.body.date, "Jour du biberon")
  );
  sendSuccess(res, { nono: [updatedNono] }, "Biberon enregistre avec succes");
};

const addWeightEntry = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await appendWeightEntry(
    readDateOnlyValue(req.body.date, "Date du poids"),
    readPositiveNumber(req.body.weightKg, "Poids")
  );
  sendSuccess(res, { nono: [updatedNono] }, "Poids enregistre avec succes");
};

const deleteBottleEntry = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await removeBottleEntry(readObjectIdValue(req.params.entryId, "Biberon"));
  sendSuccess(res, { nono: [updatedNono] }, "Biberon supprime avec succes");
};

const deleteWeightEntry = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await removeWeightEntry(readObjectIdValue(req.params.entryId, "Poids"));
  sendSuccess(res, { nono: [updatedNono] }, "Poids supprime avec succes");
};

export {
  addBottleEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteWeightEntry,
  getNonoData,
  updateBirthDate,
  updateCheckupDate,
  updateNotes,
  updateVaccineDate,
  updateVaccineReminder,
};

export const updateCare = async (req: Request, res: Response): Promise<void> => {
  const current = req.body.date === undefined ? await NonoModel.findOne().lean() : null;
  const update = buildCareUpdate("nono", String(req.params.care), req.body.intervalMonths, req.body.date, current || {});
  const record = await NonoModel.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  if (!record) throw createError("Données introuvables", 404);
  sendSuccess(res, { nono: [record] }, req.body.date === undefined
    ? "Intervalle enregistré"
    : "Soin enregistré et prochaine échéance mise à jour");
};
