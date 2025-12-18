import type { Response } from "express";
import mongoose from "mongoose";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendCreated, sendUpdated, sendDeleted } from "../utils/apiResponse.js";

/************************************ Get All Posts ************************************/
const getPosts = async (_req: AuthRequest, res: Response): Promise<void> => {
  // Grab all the posts from DB
  const posts = await ReminderPost.find().sort({ priorityColor: "desc" });
  sendSuccess(res, { posts }, "Rappels récupérés avec succès");
};

/************************************ Create New ReminderPost ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { title, body, priorityColor } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  // Create a new post and save in DB
  const post = await ReminderPost.create({ 
    user: user._id, 
    username: user.name, 
    title, 
    body, 
    priorityColor 
  });

  sendCreated(res, { post }, `Rappel "${title}" créé avec succès`);
};

/************************************ Delete ReminderPost ************************************/
const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    throw createError("Rappel non trouvé", 404);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  if (!post.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'êtes pas autorisé à supprimer ce rappel", 403);
  }

  await post.deleteOne();
  sendDeleted(res, `Rappel "${post.title}" supprimé avec succès`);
};

/************************************ Update ReminderPost ************************************/
const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { title, body, priorityColor } = req.body;

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    throw createError("Rappel non trouvé", 404);
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  if (!post.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'êtes pas autorisé à modifier ce rappel", 403);
  }

  await post.updateOne({ title, body, priorityColor });
  const updatedPost = await ReminderPost.findById(req.params.id);
  sendUpdated(res, { post: updatedPost }, `Rappel "${title}" mis à jour avec succès`);
};

export { getPosts, addPost, deletePost, updatePost };
