import express from "express";
import auth from "../middlewares/auth.js";
import { handleUpload, updateVermifugeDate, updateAntiPuceDate, getFile, getTacoData, updateAntiPuceReminder, updateVermifugeReminder } from "../controllers/TacoController.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getTacoData));
router.post("/vermifuge/date", auth, asyncHandler(updateVermifugeDate));
router.post("/vermifuge/reminder", auth, asyncHandler(updateVermifugeReminder));
router.post("/antipuce/date", auth, asyncHandler(updateAntiPuceDate));
router.post("/antipuce/reminder", auth, asyncHandler(updateAntiPuceReminder));
router.get("/image/:filename", auth, asyncHandler(getFile));
router.post("/upload", auth, handleUpload, asyncHandler((_req, res) => {
  res.status(200).send('Image uploaded successfully');
}));

export { router as TacoRoutes };

