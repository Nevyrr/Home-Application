import express from "express";
import auth from "../middlewares/auth.js";
import { handleUpload, updateVermifugeDate, updateAntiPuceDate, getFile, getTacoData, updateAntiPuceReminder, updateVermifugeReminder } from "../controllers/TacoController.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, getTacoData);
router.post("/vermifuge/date", auth, updateVermifugeDate);
router.post("/vermifuge/reminder", auth, updateVermifugeReminder);
router.post("/antipuce/date", auth, updateAntiPuceDate);
router.post("/antipuce/reminder", auth, updateAntiPuceReminder);
router.get("/image/:filename", auth, getFile);
router.post("/upload", auth, handleUpload, (_req, res) => {
  res.status(200).send('Image uploaded successfully');
});

export { router as TacoRoutes };

