import express from "express";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import {
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
} from "../controllers/TacoController.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

router.get("/", auth, asyncHandler(getTacoData));
router.post("/vermifuge/date", auth, requireWritable, asyncHandler(updateVermifugeDate));
router.post("/vermifuge/reminder", auth, requireWritable, asyncHandler(updateVermifugeReminder));
router.post("/antipuce/date", auth, requireWritable, asyncHandler(updateAntiPuceDate));
router.post("/antipuce/reminder", auth, requireWritable, asyncHandler(updateAntiPuceReminder));
router.post("/vaccine/date", auth, requireWritable, asyncHandler(updateAnnualVaccineDate));
router.post("/vaccine/reminder", auth, requireWritable, asyncHandler(updateAnnualVaccineReminder));
router.get("/image/:filename", auth, asyncHandler(getFile));
router.get("/images", auth, asyncHandler(listImages));
router.delete("/image/:filename", auth, requireWritable, asyncHandler(deleteImage));
router.post("/upload", auth, requireWritable, uploadImageMiddleware, asyncHandler(handleUpload));

export { router as TacoRoutes };
