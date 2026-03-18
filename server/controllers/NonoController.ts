import type { Request, Response } from "express";
import cron from "node-cron";
import NonoModel from "../models/NonoModel.js";
import { sendEmail } from "../config/nodeMailConfig.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

type NonoField =
  | "birthDate"
  | "checkupDate"
  | "checkupReminder"
  | "vaccineDate"
  | "vaccineReminder"
  | "vitaminReminder"
  | "administrativeReminder"
  | "notes";

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";

const EMPTY_NONO_DATA = {
  birthDate: DEFAULT_NONO_BIRTH_DATE,
  checkupDate: "",
  checkupReminder: "",
  vaccineDate: "",
  vaccineReminder: "",
  vitaminReminder: "",
  administrativeReminder: "",
  notes: "",
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

const sendReminderEmails = (subject: string, message: string): void => {
  const { EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2 } = process.env;

  if (EMAIL_RECIPIENT_1) {
    void sendEmail(EMAIL_RECIPIENT_1, subject, message).catch(() => undefined);
  }

  if (EMAIL_RECIPIENT_2) {
    void sendEmail(EMAIL_RECIPIENT_2, subject, message).catch(() => undefined);
  }
};

cron.schedule("15 8 * * *", async () => {
  const nono = await NonoModel.findOne();

  if (!nono) {
    return;
  }

  const currentDate = startOfDay(new Date());
  const reminders = [
    {
      date: nono.checkupReminder,
      subject: "rappel rendez-vous nono",
      message: "Le rappel du prochain rendez-vous pour Nono est depasse. Pensez a verifier le suivi avec votre pediatre.",
    },
    {
      date: nono.vaccineReminder,
      subject: "rappel vaccin nono",
      message: "Le rappel du prochain vaccin de Nono est depasse. Pensez a verifier la date avec votre professionnel de sante.",
    },
    {
      date: nono.vitaminReminder,
      subject: "rappel vitamine nono",
      message: "Le rappel vitamine ou ordonnance de Nono est depasse. Pensez a verifier le renouvellement.",
    },
    {
      date: nono.administrativeReminder,
      subject: "rappel demarche nono",
      message: "Le rappel pour une demarche ou une relance de Nono est depasse. Pensez a verifier les papiers en attente.",
    },
  ];

  reminders.forEach((reminder) => {
    const reminderDate = parseStoredDate(reminder.date);

    if (reminderDate && reminderDate.getTime() < currentDate.getTime()) {
      sendReminderEmails(reminder.subject, reminder.message);
    }
  });
});

const getOrCreateNono = async () => {
  const existingNono = await NonoModel.findOne();

  if (existingNono) {
    if (!existingNono.birthDate) {
      existingNono.birthDate = DEFAULT_NONO_BIRTH_DATE;
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

const updateNonoField = async (field: NonoField, value: string) => {
  const updatedNono = await NonoModel.findOneAndUpdate(
    {},
    { [field]: value },
    { new: true, upsert: true, setDefaultsOnInsert: true }
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
  const nono = await getOrCreateNono();
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

const updateCheckupReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("checkupReminder", readStringValue(req.body.date, "Rappel de rendez-vous"));
  sendNonoUpdate(res, updatedNono, "Rappel du rendez-vous mis a jour avec succes");
};

const updateVaccineDate = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("vaccineDate", readStringValue(req.body.date, "Date du vaccin"));
  sendNonoUpdate(res, updatedNono, "Date du vaccin mise a jour avec succes");
};

const updateVaccineReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("vaccineReminder", readStringValue(req.body.date, "Rappel du vaccin"));
  sendNonoUpdate(res, updatedNono, "Rappel du vaccin mis a jour avec succes");
};

const updateVitaminReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("vitaminReminder", readStringValue(req.body.date, "Rappel vitamine"));
  sendNonoUpdate(res, updatedNono, "Rappel vitamine mis a jour avec succes");
};

const updateAdministrativeReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField(
    "administrativeReminder",
    readStringValue(req.body.date, "Rappel administratif")
  );
  sendNonoUpdate(res, updatedNono, "Rappel administratif mis a jour avec succes");
};

const updateNotes = async (req: Request, res: Response): Promise<void> => {
  const updatedNono = await updateNonoField("notes", readStringValue(req.body.notes, "Pense-bete"));
  sendNonoUpdate(res, updatedNono, "Pense-bete mis a jour avec succes");
};

export {
  getNonoData,
  updateAdministrativeReminder,
  updateBirthDate,
  updateCheckupDate,
  updateCheckupReminder,
  updateNotes,
  updateVaccineDate,
  updateVaccineReminder,
  updateVitaminReminder,
};
