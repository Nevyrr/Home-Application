import express from "express";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import {
  updateCare,
  addBottleEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteWeightEntry,
  getNonoData,
  updateBirthDate,
  updateCheckupDate,
  updateNotes,
  updateVaccineDate,
  updateVaccineReminder,
} from "../controllers/NonoController.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

router.post("/care/:care", auth, requireWritable, asyncHandler(updateCare));
router.get("/", auth, asyncHandler(getNonoData));
router.post("/birth/date", auth, requireWritable, asyncHandler(updateBirthDate));
router.post("/checkup/date", auth, requireWritable, asyncHandler(updateCheckupDate));
router.post("/vaccine/date", auth, requireWritable, asyncHandler(updateVaccineDate));
router.post("/vaccine/reminder", auth, requireWritable, asyncHandler(updateVaccineReminder));
router.post("/notes", auth, requireWritable, asyncHandler(updateNotes));
router.post("/bottles", auth, requireWritable, asyncHandler(addBottleEntry));
router.post("/weights", auth, requireWritable, asyncHandler(addWeightEntry));
router.delete("/bottles/:entryId", auth, requireWritable, asyncHandler(deleteBottleEntry));
router.delete("/weights/:entryId", auth, requireWritable, asyncHandler(deleteWeightEntry));

export { router as NonoRoutes };
