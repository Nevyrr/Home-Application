import express from "express";
import {
  getEvents,
  addEvent,
  deleteEvent,
  updateEvent,
} from "../controllers/CalendarEventsController.js";
import auth from "../middlewares/auth.js";
import { validate } from "../utils/validation.js";
import { calendarEventSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", asyncHandler(getEvents));
router.post("/", auth, validate(calendarEventSchema), asyncHandler(addEvent));
router.delete("/:id", auth, asyncHandler(deleteEvent));
router.put("/:id", auth, validate(calendarEventSchema), asyncHandler(updateEvent));

export { router as CalendarEventsRoutes };

