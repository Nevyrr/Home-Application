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

// Get all posts route
router.get("/", getEvents);

// Add new post route
router.post("/", auth, addEvent);

// Delete post route
router.delete("/:id", auth, deleteEvent);

// Update post route
router.put("/:id", auth, updateEvent);

export { router as CalendarEventsRoutes };
