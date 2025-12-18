import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import mongoose from "mongoose";
import TacoModel from "../models/TacoModel.js";
import cron from "node-cron";
import { sendEmail } from "../config/nodeMailConfig.js";
import { createError } from "../middlewares/errorHandler.js";

/* ------ SETUP CRON JOB ------ */

// Cron job execute every day at 8am
cron.schedule('0 8 * * *', async () => {
    console.log('Send reminders emails');
    const taco = await TacoModel.find();

    if (taco.length === 0) return;

    // Current Date
    const currentDate = new Date();

    const [day1, month1, year1] = taco[0].vermifugeReminder.split('/');
    const vermifugeReminderDate = new Date(`${year1}-${month1}-${day1}`);

    const [day2, month2, year2] = taco[0].antiPuceReminder.split('/');
    const antiPuceReminderDate = new Date(`${year2}-${month2}-${day2}`);

    if (vermifugeReminderDate.getTime() < currentDate.getTime()) {
        const { EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2 } = process.env;
        if (EMAIL_RECIPIENT_1) {
            sendEmail(EMAIL_RECIPIENT_1, "rappel vermifuge coco", "La date du rappel du vermifuge pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        }
        if (EMAIL_RECIPIENT_2) {
            sendEmail(EMAIL_RECIPIENT_2, "rappel vermifuge coco", "La date du rappel du vermifuge pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        }
    }

    if (antiPuceReminderDate.getTime() < currentDate.getTime()) {
        const { EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2 } = process.env;
        if (EMAIL_RECIPIENT_1) {
            sendEmail(EMAIL_RECIPIENT_1, "rappel anti-puce coco", "La date du rappel de l'anti-puce pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        }
        if (EMAIL_RECIPIENT_2) {
            sendEmail(EMAIL_RECIPIENT_2, "rappel anti-puce coco", "La date du rappel de l'anti-puce pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        }
    }
});


/* ------ SETUP MONGO IMAGE UPLOAD ------ */

import { env } from "../config/env.js";

const conn = mongoose.createConnection(env.DB_URI);
let gfs: Grid.Grid;
conn.once('open', () => {
    // Initialize stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('images');
});

// Create storage engine for multer
const storage = new GridFsStorage({
    url: env.DB_URI,
    file: (_req: Request, file: Express.Multer.File) => {
        return {
            filename: file.originalname,
            bucketName: 'images',
        };
    },
});

const upload = multer({ storage });

const getTacoData = async (_req: Request, res: Response): Promise<void> => {
    const taco = await TacoModel.find();
    sendSuccess(res, { taco }, "Données Taco récupérées avec succès");
};

const updateVermifugeDate = async (req: Request, res: Response): Promise<void> => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { vermifugeDate: req.body.date },
        { new: true }
    );

    if (!updatedTaco) {
        throw createError("Données Taco non trouvées", 404);
    }

    // Format compatible avec l'ancien frontend
    const response: any = {
      success: "Date de vermifuge mise à jour avec succès",
      taco: [updatedTaco], // Tableau pour compatibilité
      data: { taco: updatedTaco },
    };
    res.status(200).json(response);
};

const updateVermifugeReminder = async (req: Request, res: Response): Promise<void> => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { vermifugeReminder: req.body.date },
        { new: true }
    );

    if (!updatedTaco) {
        throw createError("Données Taco non trouvées", 404);
    }

    // Format compatible avec l'ancien frontend
    const response: any = {
      success: "Rappel de vermifuge mis à jour avec succès",
      taco: [updatedTaco],
      data: { taco: updatedTaco },
    };
    res.status(200).json(response);
};

const updateAntiPuceDate = async (req: Request, res: Response): Promise<void> => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { antiPuceDate: req.body.date },
        { new: true }
    );

    if (!updatedTaco) {
        throw createError("Données Taco non trouvées", 404);
    }

    // Format compatible avec l'ancien frontend
    const response: any = {
      success: "Date d'anti-puce mise à jour avec succès",
      taco: [updatedTaco],
      data: { taco: updatedTaco },
    };
    res.status(200).json(response);
};

const updateAntiPuceReminder = async (req: Request, res: Response): Promise<void> => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { antiPuceReminder: req.body.date },
        { new: true }
    );

    if (!updatedTaco) {
        throw createError("Données Taco non trouvées", 404);
    }

    // Format compatible avec l'ancien frontend
    const response: any = {
      success: "Rappel d'anti-puce mis à jour avec succès",
      taco: [updatedTaco],
      data: { taco: updatedTaco },
    };
    res.status(200).json(response);
};

const getFile = async (req: Request, res: Response): Promise<void> => {
    if (!gfs) {
        throw createError('GridFS non initialisé', 500);
    }

    gfs.files.findOne({ filename: req.params.filename }, (_err, file) => {
        if (!file || file.length === 0) {
            sendNotFound(res, 'Fichier non trouvé');
            return;
        }
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            sendNotFound(res, 'Ce n\'est pas une image');
        }
    });
};

// Middleware to handle file upload
function handleUpload(req: Request, res: Response, next: NextFunction): void {
    upload.single('image')(req, res, (err) => {
        if (err) {
            res.status(500).send('Erreur lors du téléchargement de l\'image');
            return;
        }
        next();
    });
}

export { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder, getFile, handleUpload };

