import type { Response } from "express";
import mongoose from "mongoose";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendCreated, sendUpdated, sendDeleted } from "../utils/apiResponse.js";

/************************************ Get All Posts ************************************/
const getPosts = async (_req: AuthRequest, res: Response): Promise<void> => {
  const posts = await ReminderPost.find().sort({ sortOrder: "asc", createdAt: "asc" });
  sendSuccess(res, { posts }, "Rappels recuperes avec succes");
};

/************************************ Create New ReminderPost ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, priorityColor = 0, status, dueDate } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  const lastPost = await ReminderPost.findOne().sort({ sortOrder: "desc" });
  const sortOrder = (lastPost?.sortOrder ?? -1) + 1;

  const post = await ReminderPost.create({
    user: user._id,
    username: user.name,
    title,
    body,
    priorityColor,
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
    sortOrder,
  });

  sendCreated(res, { post }, `Rappel "${title}" cree avec succes`);
};

/************************************ Delete ReminderPost ************************************/
const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    throw createError("Rappel non trouve", 404);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  if (!post.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'etes pas autorise a supprimer ce rappel", 403);
  }

  await post.deleteOne();
  sendDeleted(res, `Rappel "${post.title}" supprime avec succes`);
};

/************************************ Update ReminderPost ************************************/
const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, priorityColor = 0, status, dueDate, sortOrder } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    throw createError("Rappel non trouve", 404);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  if (!post.user.equals(user._id) && !user.isAdmin) {
    throw createError("Vous n'etes pas autorise a modifier ce rappel", 403);
  }

  await post.updateOne({
    title,
    body,
    priorityColor,
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
    sortOrder: sortOrder ?? post.sortOrder,
  });

  const updatedPost = await ReminderPost.findById(req.params.id);
  sendUpdated(res, { post: updatedPost }, `Rappel "${title}" mis a jour avec succes`);
};

const reorderPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderedIds } = req.body as { orderedIds: string[] };

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const uniqueIds = [...new Set(orderedIds)];

  if (uniqueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw createError("Un ou plusieurs identifiants sont invalides", 400);
  }

  await ReminderPost.bulkWrite(
    uniqueIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index } },
      },
    }))
  );

  sendUpdated(res, undefined, "Ordre des taches mis a jour");
};

export { getPosts, addPost, deletePost, updatePost, reorderPosts };
