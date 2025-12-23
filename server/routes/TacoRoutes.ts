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
router.post("/upload", (_req, _res, next) => {
    console.log('[ROUTE] POST /upload appelé');
    next();
}, auth, (_req, _res, next) => {
    console.log('[ROUTE] Auth passé');
    next();
}, checkStorage, (_req, _res, next) => {
    console.log('[ROUTE] checkStorage passé');
    next();
}, getUploadMiddleware(), (_req, _res, next) => {
    console.log('[ROUTE] Multer middleware passé');
    next();
}, asyncHandler(handleUpload));

export { router as TacoRoutes };

