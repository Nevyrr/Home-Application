import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import cron from "node-cron";
import TacoModel from "../models/TacoModel.js";
import ImageModel from "../models/ImageModel.js";
import { sendEmail } from "../config/nodeMailConfig.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendNotFound, sendError } from "../utils/apiResponse.js";

/* ------ SETUP CRON JOB ------ */

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
        sendEmail(EMAIL_RECIPIENT_1, subject, message);
    }

    if (EMAIL_RECIPIENT_2) {
        sendEmail(EMAIL_RECIPIENT_2, subject, message);
    }
};

cron.schedule("0 8 * * *", async () => {
    console.log("Send reminders emails");
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

/* ------ SETUP MONGO IMAGE UPLOAD ------ */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

console.log("Multer memoryStorage initialise avec succes");

const checkStorage = (_req: Request, res: Response, next: NextFunction): void => {
    console.log("[checkStorage] Verification du storage...");
    if (!upload) {
        console.error("[checkStorage] Upload non initialise");
        res.status(500).json({
            success: false,
            error: "Le systeme de stockage n'est pas encore initialise. Veuillez reessayer.",
        });
        return;
    }
    console.log("[checkStorage] Storage OK");
    next();
};

const getUploadMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log("[getUploadMiddleware] Appel du middleware multer");
        console.log("[getUploadMiddleware] Content-Type:", req.headers["content-type"]);
        console.log("[getUploadMiddleware] Content-Length:", req.headers["content-length"]);

        if (!upload) {
            console.error("[getUploadMiddleware] Upload non initialise");
            res.status(500).json({
                success: false,
                error: "Le systeme de stockage n'est pas encore initialise. Veuillez reessayer.",
            });
            return;
        }

        const timeout = setTimeout(() => {
            console.error("[getUploadMiddleware] TIMEOUT: multer n'a pas repondu apres 30 secondes");
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Timeout lors du traitement du fichier",
                });
            }
        }, 30000);

        console.log('[getUploadMiddleware] Appel de upload.single("image") en cours');
        try {
            upload.single("image")(req, res, (err) => {
                clearTimeout(timeout);
                console.log("[getUploadMiddleware] Callback multer appele", {
                    err: err ? err.message : null,
                    hasFile: !!req.file,
                    fileInfo: req.file ? { size: req.file.size } : null,
                });
                if (err) {
                    console.error("[getUploadMiddleware] Erreur multer:", err);
                    console.error("[getUploadMiddleware] Stack:", err.stack);
                    return next(err);
                }
                next();
            });
        } catch (error) {
            clearTimeout(timeout);
            console.error("[getUploadMiddleware] Exception lors de l'appel multer:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: "Erreur lors du traitement du fichier: " + (error instanceof Error ? error.message : "Erreur inconnue"),
                });
            }
        }
    };
};

const handleUpload = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.log("[handleUpload] Traitement du fichier uploade");
    console.log(
        "[handleUpload] Fichier:",
        req.file
            ? {
                  originalname: req.file.originalname,
                  mimetype: req.file.mimetype,
                  size: req.file.size,
                  hasBuffer: !!req.file.buffer,
              }
            : "null"
    );

    if (!req.file) {
        console.log("[handleUpload] Aucun fichier dans la requete");
        res.status(400).json({
            success: false,
            error: "Aucun fichier fourni",
        });
        return;
    }

    if (req.file.mimetype !== "image/png" && req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/jpg") {
        console.log("[handleUpload] Type de fichier invalide:", req.file.mimetype);
        res.status(400).json({
            success: false,
            error: "Seuls les fichiers PNG et JPG sont acceptes",
        });
        return;
    }

    if (!req.file.buffer) {
        console.error("[handleUpload] Pas de buffer disponible");
        res.status(500).json({
            success: false,
            error: "Erreur lors de la reception du fichier",
        });
        return;
    }

    console.log("[handleUpload] Buffer recu:", req.file.buffer.length, "bytes");
    console.log("[handleUpload] Upload vers MongoDB...");

    try {
        const file = req.file;
        const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        console.log("[handleUpload] Nom du fichier genere:", filename);

        const image = new ImageModel({
            filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.buffer.length,
            data: file.buffer,
        });

        await image.save();
        console.log("[handleUpload] Image sauvegardee avec succes, ID:", image._id.toString());

        if (!res.headersSent) {
            sendSuccess(
                res,
                {
                    filename,
                    originalName: file.originalname,
                    id: image._id.toString(),
                },
                "Image uploadee avec succes"
            );
        }
    } catch (error) {
        console.error("[handleUpload] Erreur lors de l'upload:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de l'upload vers MongoDB: " + (error instanceof Error ? error.message : "Erreur inconnue"),
        });
    }
};

const getTacoData = async (_req: Request, res: Response): Promise<void> => {
    const taco = await TacoModel.find();
    sendSuccess(res, { taco }, "Donnees Taco recuperees avec succes");
};

const updateTacoField = async (field: string, date: string, successMessage: string): Promise<any> => {
    const updatedTaco = await TacoModel.findOneAndUpdate({}, { [field]: date }, { new: true });

    if (!updatedTaco) {
        throw createError("Donnees Taco non trouvees", 404);
    }

    return {
        success: successMessage,
        taco: [updatedTaco],
        data: { taco: updatedTaco },
    };
};

const updateVermifugeDate = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField("vermifugeDate", req.body.date, "Date de vermifuge mise a jour avec succes");
    res.status(200).json(response);
};

const updateVermifugeReminder = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField(
        "vermifugeReminder",
        req.body.date,
        "Rappel de vermifuge mis a jour avec succes"
    );
    res.status(200).json(response);
};

const updateAntiPuceDate = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField("antiPuceDate", req.body.date, "Date d'anti-puce mise a jour avec succes");
    res.status(200).json(response);
};

const updateAntiPuceReminder = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField(
        "antiPuceReminder",
        req.body.date,
        "Rappel d'anti-puce mis a jour avec succes"
    );
    res.status(200).json(response);
};

const updateAnnualVaccineDate = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField(
        "annualVaccineDate",
        req.body.date,
        "Date du vaccin annuel mise a jour avec succes"
    );
    res.status(200).json(response);
};

const updateAnnualVaccineReminder = async (req: Request, res: Response): Promise<void> => {
    const response = await updateTacoField(
        "annualVaccineReminder",
        req.body.date,
        "Rappel du vaccin annuel mis a jour avec succes"
    );
    res.status(200).json(response);
};

const getFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const image = await ImageModel.findOne({ filename: req.params.filename });

        if (!image) {
            sendNotFound(res, "Fichier non trouve");
            return;
        }

        if (image.mimetype === "image/jpeg" || image.mimetype === "image/png" || image.mimetype === "image/jpg") {
            res.set("Content-Type", image.mimetype);
            res.set("Content-Length", image.size.toString());
            res.set("Cache-Control", "public, max-age=31536000");
            res.send(Buffer.from(image.data));
        } else {
            sendNotFound(res, "Ce n'est pas une image");
        }
    } catch (error) {
        console.error("Erreur lors de la recuperation du fichier:", error);
        sendError(res, "Erreur lors de la recuperation du fichier", 500);
    }
};

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const image = await ImageModel.findOneAndDelete({ filename: req.params.filename });

        if (!image) {
            sendNotFound(res, "Image non trouvee");
            return;
        }

        sendSuccess(res, { filename: image.filename }, "Image supprimee avec succes");
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
        sendError(res, "Erreur lors de la suppression de l'image", 500);
    }
};

const listImages = async (_req: Request, res: Response): Promise<void> => {
    try {
        const images = await ImageModel.find({
            $or: [{ mimetype: "image/png" }, { mimetype: "image/jpeg" }, { mimetype: "image/jpg" }],
        })
            .sort({ createdAt: -1 })
            .select("filename mimetype size createdAt");

        if (!images || images.length === 0) {
            sendSuccess(res, { images: [] }, "Aucune image trouvee");
            return;
        }

        const imagesList = images.map((image) => ({
            filename: image.filename,
            uploadDate: image.createdAt || new Date(),
            length: image.size,
        }));

        sendSuccess(res, { images: imagesList }, "Images recuperees avec succes");
    } catch (error) {
        console.error("Erreur lors de la recuperation des images:", error);
        throw createError("Erreur lors de la recuperation des images", 500);
    }
};

export {
    getTacoData,
    updateVermifugeDate,
    updateVermifugeReminder,
    updateAntiPuceDate,
    updateAntiPuceReminder,
    updateAnnualVaccineDate,
    updateAnnualVaccineReminder,
    getFile,
    handleUpload,
    checkStorage,
    getUploadMiddleware,
    listImages,
    deleteImage,
};
