import express from "express";
import {
  getEvents,
  addEvent,
  deleteEvent,
  updateEvent,
} from "../controllers/CalendarEventsController.js";
import auth from "../middlewares/auth.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", getEvents);
router.post("/", auth, addEvent);
router.delete("/:id", auth, deleteEvent);
router.put("/:id", auth, updateEvent);

export { router as CalendarEventsRoutes };
