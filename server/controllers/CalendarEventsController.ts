import type { Response } from "express";
import mongoose from "mongoose";
import CalendarEvent from "../models/CalendarEventModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendCreated, sendUpdated, sendDeleted } from "../utils/apiResponse.js";

/************************************ Get All Events ************************************/
const getEvents = async (_req: AuthRequest, res: Response): Promise<void> => {
  // Grab all the events from DB
  const events = await CalendarEvent.find().sort({ priorityColor: "desc" });
  sendSuccess(res, { events }, "Événements récupérés avec succès");
};

/************************************ Create New Calendar Event ************************************/
const addEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { title, date, duration, priorityColor } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  // Create a new Event and save in DB
  const event = await CalendarEvent.create({ 
    user: user._id, 
    username: user.name, 
    title, 
    date, 
    duration, 
    priorityColor 
  });

  sendCreated(res, { event }, `Événement "${title}" créé avec succès`);
};

/************************************ Delete Calendar Events ************************************/
const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    throw createError("Événement calendrier non trouvé", 404);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  if (!event.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'êtes pas autorisé à supprimer cet événement", 403);
  }

  await event.deleteOne();
  sendDeleted(res, `Événement "${event.title}" supprimé avec succès`);
};

/************************************ Update Calendar Events ************************************/
const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { title, date, duration, priorityColor } = req.body;

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    throw createError("Événement calendrier non trouvé", 404);
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  if (!event.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'êtes pas autorisé à modifier cet événement", 403);
  }

  await event.updateOne({ title, date, duration, priorityColor });
  const updatedEvent = await CalendarEvent.findById(req.params.id);
  sendUpdated(res, { event: updatedEvent }, `Événement "${title}" mis à jour avec succès`);
};

export { getEvents, addEvent, deleteEvent, updateEvent };
