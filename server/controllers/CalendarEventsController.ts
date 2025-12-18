import type { Request, Response } from "express";
import mongoose from "mongoose";
import CalendarEvent from "../models/CalendarEventModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";

/************************************ Get All Events ************************************/
const getEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Grab all the events from DB
    const events = await CalendarEvent.find().sort({ priorityColor: "desc" });
    res.status(200).json({ events });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};


/************************************ Create New Calendar Event ************************************/
const addEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { title, date, duration, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  } else if (!date) {
    res.status(400).json({ error: "Date needs to be selected" });
    return;
  } else if (priorityColor === undefined) {
    res.status(400).json({ error: "Priority color needs to be selected" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  try {
    // Create a new Event and save in DB
    const event = await CalendarEvent.create({ user: user._id, username: user.name, title: title, date: date, duration: duration, priorityColor: priorityColor });

    res.status(200).json({ success: title + " event created", event });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Delete Calendar Events ************************************/
const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "Incorrect ID" });
    return;
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    res.status(400).json({ error: "calendar event not found" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (!event.user.equals(user._id) && !user.isAdmin) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  try {
    await event.deleteOne();
    res.status(200).json({ success: event.title + " calendar event was deleted" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Update Calendar Events ************************************/
const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { title, date, duration, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  if (date === undefined) {
    res.status(400).json({ error: "Date is required" });
    return;
  }

  if (priorityColor === undefined) {
    res.status(400).json({ error: "Priority color is required" });
    return;
  }

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "Incorrect ID" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    res.status(400).json({ error: "calendar event not found" });
    return;
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (!event.user.equals(user._id) && !user.isAdmin) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  try {
    await event.updateOne({ title: title, date: date, duration: duration, priorityColor: priorityColor });
    res.status(200).json({ success: title + " calendar event was updated", event });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

export { getEvents, addEvent, deleteEvent, updateEvent };

