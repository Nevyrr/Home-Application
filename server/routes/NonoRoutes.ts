import express from "express";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import {
  getNonoData,
  updateAdministrativeReminder,
  updateBirthDate,
  updateCheckupDate,
  updateCheckupReminder,
  updateNotes,
  updateVaccineDate,
  updateVaccineReminder,
  updateVitaminReminder,
} from "../controllers/NonoController.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

router.get("/", auth, asyncHandler(getNonoData));
router.post("/birth/date", auth, requireWritable, asyncHandler(updateBirthDate));
router.post("/checkup/date", auth, requireWritable, asyncHandler(updateCheckupDate));
router.post("/checkup/reminder", auth, requireWritable, asyncHandler(updateCheckupReminder));
router.post("/vaccine/date", auth, requireWritable, asyncHandler(updateVaccineDate));
router.post("/vaccine/reminder", auth, requireWritable, asyncHandler(updateVaccineReminder));
router.post("/vitamin/reminder", auth, requireWritable, asyncHandler(updateVitaminReminder));
router.post("/administrative/reminder", auth, requireWritable, asyncHandler(updateAdministrativeReminder));
router.post("/notes", auth, requireWritable, asyncHandler(updateNotes));

export { router as NonoRoutes };
