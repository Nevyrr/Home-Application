import type { Request, Response } from "express";
import multer from "multer";
import cron from "node-cron";
import TacoModel from "../models/TacoModel.js";
import ImageModel from "../models/ImageModel.js";
import { sendEmail } from "../config/nodeMailConfig.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendNotFound, sendSuccess } from "../utils/apiResponse.js";

type TacoField =
  | "vermifugeDate"
  | "vermifugeReminder"
  | "antiPuceDate"
  | "antiPuceReminder"
  | "annualVaccineDate"
  | "annualVaccineReminder";

const DEFAULT_TACO_BIRTH_DATE = "07/08/2022";
const DEFAULT_TACO_WEIGHT_KG = 16.7;

const EMPTY_TACO_DATA = {
  vermifugeDate: "",
  vermifugeReminder: "",
  antiPuceDate: "",
  antiPuceReminder: "",
  annualVaccineDate: "",
  annualVaccineReminder: "",
  birthDate: DEFAULT_TACO_BIRTH_DATE,
  weightKg: DEFAULT_TACO_WEIGHT_KG,
};

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);

const parseReminderDate = (dateString: string): Date | null => {
  if (!dateString) {
    return null;
  }

  const [day, month, year] = dateString.split("/");

  if (!day || !month || !year) {
    return null;
  }

  const parsedDate = new Date(`${year}-${month}-${day}`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const sendReminderEmails = (subject: string, message: string): void => {
  const { EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2 } = process.env;

  if (EMAIL_RECIPIENT_1) {
    void sendEmail(EMAIL_RECIPIENT_1, subject, message).catch(() => undefined);
  }

  if (EMAIL_RECIPIENT_2) {
    void sendEmail(EMAIL_RECIPIENT_2, subject, message).catch(() => undefined);
  }
};

cron.schedule("0 8 * * *", async () => {
  const taco = await TacoModel.findOne();

  if (!taco) {
    return;
  }

  const currentDate = new Date();
  const vermifugeReminderDate = parseReminderDate(taco.vermifugeReminder);
  const antiPuceReminderDate = parseReminderDate(taco.antiPuceReminder);
  const annualVaccineReminderDate = parseReminderDate(taco.annualVaccineReminder);

  if (vermifugeReminderDate && vermifugeReminderDate.getTime() < currentDate.getTime()) {
    sendReminderEmails(
      "rappel vermifuge coco",
      "La date du rappel du vermifuge pour Taco DAVIN est desormais depassee. Pensez a le faire au plus vite !"
    );
  }

  if (antiPuceReminderDate && antiPuceReminderDate.getTime() < currentDate.getTime()) {
    sendReminderEmails(
      "rappel anti-puce coco",
      "La date du rappel de l'anti-puce pour Taco DAVIN est desormais depassee. Pensez a le faire au plus vite !"
    );
  }

  if (annualVaccineReminderDate && annualVaccineReminderDate.getTime() < currentDate.getTime()) {
    sendReminderEmails(
      "rappel vaccin annuel taco",
      "La date du rappel du vaccin annuel pour Taco DAVIN est desormais depassee. Pensez a prendre rendez-vous au plus vite !"
    );
  }
});

const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(createError("Seuls les fichiers PNG et JPG sont acceptes", 400));
      return;
    }

    callback(null, true);
  },
}).single("image");

const getOrCreateTaco = async () => {
  const existingTaco = await TacoModel.findOne();

  if (existingTaco) {
    let hasChanges = false;

    if (!existingTaco.birthDate) {
      existingTaco.birthDate = DEFAULT_TACO_BIRTH_DATE;
      hasChanges = true;
    }

    if (typeof existingTaco.weightKg !== "number" || Number.isNaN(existingTaco.weightKg)) {
      existingTaco.weightKg = DEFAULT_TACO_WEIGHT_KG;
      hasChanges = true;
    }

    if (hasChanges) {
      await existingTaco.save();
    }

    return existingTaco;
  }

  return TacoModel.create(EMPTY_TACO_DATA);
};

const updateTacoField = async (field: TacoField, date: string) => {
  const updatedTaco = await TacoModel.findOneAndUpdate(
    {},
    { [field]: date },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!updatedTaco) {
    throw createError("Donnees Taco non trouvees", 404);
  }

  return updatedTaco;
};

const requireDateValue = (date: unknown): string => {
  if (typeof date !== "string" || !date.trim()) {
    throw createError("Date manquante", 400);
  }

  return date.trim();
};

const sendTacoUpdate = (res: Response, taco: Awaited<ReturnType<typeof updateTacoField>>, message: string): void => {
  sendSuccess(res, { taco: [taco] }, message);
};

const getTacoData = async (_req: Request, res: Response): Promise<void> => {
  const taco = await getOrCreateTaco();
  sendSuccess(res, { taco: [taco] }, "Donnees Taco recuperees avec succes");
};

const updateVermifugeDate = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("vermifugeDate", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Date de vermifuge mise a jour avec succes");
};

const updateVermifugeReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("vermifugeReminder", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Rappel de vermifuge mis a jour avec succes");
};

const updateAntiPuceDate = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("antiPuceDate", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Date d'anti-puce mise a jour avec succes");
};

const updateAntiPuceReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("antiPuceReminder", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Rappel d'anti-puce mis a jour avec succes");
};

const updateAnnualVaccineDate = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("annualVaccineDate", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Date du vaccin annuel mise a jour avec succes");
};

const updateAnnualVaccineReminder = async (req: Request, res: Response): Promise<void> => {
  const updatedTaco = await updateTacoField("annualVaccineReminder", requireDateValue(req.body.date));
  sendTacoUpdate(res, updatedTaco, "Rappel du vaccin annuel mis a jour avec succes");
};

const handleUpload = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;

  if (!file) {
    throw createError("Aucun fichier fourni", 400);
  }

  if (!file.buffer) {
    throw createError("Erreur lors de la reception du fichier", 500);
  }

  const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const image = await ImageModel.create({
    filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.buffer.length,
    data: file.buffer,
  });

  sendSuccess(
    res,
    {
      filename,
      originalName: file.originalname,
      id: image._id.toString(),
    },
    "Image uploadee avec succes"
  );
};

const getFile = async (req: Request, res: Response): Promise<void> => {
  const image = await ImageModel.findOne({ filename: req.params.filename });

  if (!image) {
    sendNotFound(res, "Fichier non trouve");
    return;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(image.mimetype)) {
    sendNotFound(res, "Ce fichier n'est pas une image");
    return;
  }

  res.set("Content-Type", image.mimetype);
  res.set("Content-Length", image.size.toString());
  res.set("Cache-Control", "public, max-age=31536000");
  res.send(Buffer.from(image.data));
};

const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const image = await ImageModel.findOneAndDelete({ filename: req.params.filename });

  if (!image) {
    sendNotFound(res, "Image non trouvee");
    return;
  }

  sendSuccess(res, { filename: image.filename }, "Image supprimee avec succes");
};

const listImages = async (_req: Request, res: Response): Promise<void> => {
  const images = await ImageModel.find({
    mimetype: { $in: Array.from(ALLOWED_IMAGE_MIME_TYPES) },
  })
    .sort({ createdAt: -1 })
    .select("filename size createdAt");

  const imagesList = images.map((image) => ({
    filename: image.filename,
    uploadDate: image.createdAt?.toISOString() || new Date().toISOString(),
    length: image.size,
  }));

  sendSuccess(
    res,
    { images: imagesList },
    imagesList.length > 0 ? "Images recuperees avec succes" : "Aucune image trouvee"
  );
};

export {
  deleteImage,
  getFile,
  getTacoData,
  handleUpload,
  listImages,
  updateAnnualVaccineDate,
  updateAnnualVaccineReminder,
  updateAntiPuceDate,
  updateAntiPuceReminder,
  updateVermifugeDate,
  updateVermifugeReminder,
  uploadImageMiddleware,
};
