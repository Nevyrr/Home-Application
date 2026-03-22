import express from "express";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import {
  addBottleEntry,
  addDiaperEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteDiaperEntry,
  deleteWeightEntry,
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
router.post("/bottles", auth, requireWritable, asyncHandler(addBottleEntry));
router.post("/diapers", auth, requireWritable, asyncHandler(addDiaperEntry));
router.post("/weights", auth, requireWritable, asyncHandler(addWeightEntry));
router.delete("/bottles/:entryId", auth, requireWritable, asyncHandler(deleteBottleEntry));
router.delete("/diapers/:entryId", auth, requireWritable, asyncHandler(deleteDiaperEntry));
router.delete("/weights/:entryId", auth, requireWritable, asyncHandler(deleteWeightEntry));

export { router as NonoRoutes };
