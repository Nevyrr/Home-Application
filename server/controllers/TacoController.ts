import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import TacoModel from "../models/TacoModel.js";
import ImageModel from "../models/ImageModel.js";
import cron from "node-cron";
import { sendEmail } from "../config/nodeMailConfig.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendNotFound, sendError } from "../utils/apiResponse.js";

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

// Utiliser memoryStorage de multer et stocker directement dans MongoDB avec Mongoose
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

console.log('Multer memoryStorage initialisé avec succès');

// Middleware pour vérifier que storage est initialisé
const checkStorage = (_req: Request, res: Response, next: NextFunction): void => {
    console.log('[checkStorage] Vérification du storage...');
    if (!upload) {
        console.error('[checkStorage] Upload non initialisé');
        res.status(500).json({
            success: false,
            error: 'Le système de stockage n\'est pas encore initialisé. Veuillez réessayer.',
        });
        return;
    }
    console.log('[checkStorage] Storage OK');
    next();
};

// Retourner le middleware multer pour l'upload
const getUploadMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log('[getUploadMiddleware] Appel du middleware multer');
        console.log('[getUploadMiddleware] Content-Type:', req.headers['content-type']);
        console.log('[getUploadMiddleware] Content-Length:', req.headers['content-length']);
        
        if (!upload) {
            console.error('[getUploadMiddleware] Upload non initialisé');
            res.status(500).json({
                success: false,
                error: 'Le système de stockage n\'est pas encore initialisé. Veuillez réessayer.',
            });
            return;
        }
        
        // Timeout pour éviter les blocages
        const timeout = setTimeout(() => {
            console.error('[getUploadMiddleware] TIMEOUT: multer n\'a pas répondu après 30 secondes');
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Timeout lors du traitement du fichier',
                });
            }
        }, 30000);
        
        console.log('[getUploadMiddleware] Appel de upload.single("image") en cours');
        try {
            upload.single('image')(req, res, (err) => {
                clearTimeout(timeout);
                console.log('[getUploadMiddleware] Callback multer appelé', { 
                    err: err ? err.message : null, 
                    hasFile: !!req.file,
                    fileInfo: req.file ? { size: req.file.size } : null
                });
                if (err) {
                    console.error('[getUploadMiddleware] Erreur multer:', err);
                    console.error('[getUploadMiddleware] Stack:', err.stack);
                    return next(err);
                }
                next();
            });
        } catch (error) {
            clearTimeout(timeout);
            console.error('[getUploadMiddleware] Exception lors de l\'appel multer:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors du traitement du fichier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'),
                });
            }
        }
    };
};

// Handler pour traiter le fichier après l'upload par multer (memoryStorage)
const handleUpload = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.log('[handleUpload] Traitement du fichier uploadé');
    console.log('[handleUpload] Fichier:', req.file ? { 
        originalname: req.file.originalname, 
        mimetype: req.file.mimetype, 
        size: req.file.size,
        hasBuffer: !!req.file.buffer 
    } : 'null');
    
    if (!req.file) {
        console.log('[handleUpload] Aucun fichier dans la requête');
        res.status(400).json({
            success: false,
            error: 'Aucun fichier fourni',
        });
        return;
    }

    // Vérifier que c'est un PNG ou JPG
    if (req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/jpg') {
        console.log('[handleUpload] Type de fichier invalide:', req.file.mimetype);
        res.status(400).json({
            success: false,
            error: 'Seuls les fichiers PNG et JPG sont acceptés',
        });
        return;
    }

    // Vérifier que le buffer existe (memoryStorage)
    if (!req.file.buffer) {
        console.error('[handleUpload] Pas de buffer disponible');
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la réception du fichier',
        });
        return;
    }

    console.log('[handleUpload] Buffer reçu:', req.file.buffer.length, 'bytes');
    console.log('[handleUpload] Upload vers MongoDB...');

    try {
        const file = req.file;
        const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        console.log('[handleUpload] Nom du fichier généré:', filename);

        // Créer un nouveau document Image dans MongoDB
        const image = new ImageModel({
            filename: filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.buffer.length,
            data: file.buffer
        });

        await image.save();
        console.log('[handleUpload] Image sauvegardée avec succès, ID:', image._id.toString());

        // Retourner le nom du fichier
        if (!res.headersSent) {
            sendSuccess(res, { 
                filename: filename,
                originalName: file.originalname,
                id: image._id.toString(),
            }, 'Image uploadée avec succès');
        }
    } catch (error) {
        console.error('[handleUpload] Erreur lors de l\'upload:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'upload vers MongoDB: ' + (error instanceof Error ? error.message : 'Erreur inconnue'),
        });
    }
};

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
    try {
        const image = await ImageModel.findOne({ filename: req.params.filename });
        
        if (!image) {
            sendNotFound(res, 'Fichier non trouvé');
            return;
        }
        
        if (image.mimetype === 'image/jpeg' || image.mimetype === 'image/png' || image.mimetype === 'image/jpg') {
            res.set('Content-Type', image.mimetype);
            res.set('Content-Length', image.size.toString());
            res.set('Cache-Control', 'public, max-age=31536000'); // Cache pour 1 an
            res.send(Buffer.from(image.data));
        } else {
            sendNotFound(res, 'Ce n\'est pas une image');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du fichier:', error);
        sendError(res, 'Erreur lors de la récupération du fichier', 500);
    }
};

// Supprimer une image
const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const image = await ImageModel.findOneAndDelete({ filename: req.params.filename });
        
        if (!image) {
            sendNotFound(res, 'Image non trouvée');
            return;
        }
        
        sendSuccess(res, { filename: image.filename }, 'Image supprimée avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
        sendError(res, 'Erreur lors de la suppression de l\'image', 500);
    }
};

// Liste tous les fichiers PNG et JPG
const listImages = async (_req: Request, res: Response): Promise<void> => {
    try {
        const images = await ImageModel.find({ 
            $or: [
                { mimetype: 'image/png' },
                { mimetype: 'image/jpeg' },
                { mimetype: 'image/jpg' }
            ]
        }).sort({ createdAt: -1 }).select('filename mimetype size createdAt');

        if (!images || images.length === 0) {
            sendSuccess(res, { images: [] }, 'Aucune image trouvée');
            return;
        }

        const imagesList = images.map(image => ({
            filename: image.filename,
            uploadDate: image.createdAt || new Date(),
            length: image.size,
        }));

        sendSuccess(res, { images: imagesList }, 'Images récupérées avec succès');
    } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
        throw createError('Erreur lors de la récupération des images', 500);
    }
};

export { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder, getFile, handleUpload, checkStorage, getUploadMiddleware, listImages, deleteImage };
