import express from "express";
import auth from "../middlewares/auth.js";
import { handleUpload, checkStorage, getUploadMiddleware, updateVermifugeDate, updateAntiPuceDate, getFile, getTacoData, updateAntiPuceReminder, updateVermifugeReminder, listImages, deleteImage } from "../controllers/TacoController.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getTacoData));
router.post("/vermifuge/date", auth, asyncHandler(updateVermifugeDate));
router.post("/vermifuge/reminder", auth, asyncHandler(updateVermifugeReminder));
router.post("/antipuce/date", auth, asyncHandler(updateAntiPuceDate));
router.post("/antipuce/reminder", auth, asyncHandler(updateAntiPuceReminder));
router.get("/image/:filename", auth, asyncHandler(getFile));
router.get("/images", auth, asyncHandler(listImages));
router.delete("/image/:filename", auth, asyncHandler(deleteImage));
router.post("/upload", (req, res, next) => {
    console.log('[ROUTE] POST /upload appelé');
    next();
}, auth, (req, res, next) => {
    console.log('[ROUTE] Auth passé');
    next();
}, checkStorage, (req, res, next) => {
    console.log('[ROUTE] checkStorage passé');
    next();
}, getUploadMiddleware(), (req, res, next) => {
    console.log('[ROUTE] Multer middleware passé');
    next();
}, asyncHandler(handleUpload));

export { router as TacoRoutes };

