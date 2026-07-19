import type { Response } from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendCreated, sendUpdated, sendDeleted } from "../utils/apiResponse.js";
import { sendReminderEmails } from "../utils/reminderEmails.js";
import { logger } from "../utils/logger.js";

/**
 * Envoie un email pour chaque tache (avec montant) arrivee a echeance et non terminee,
 * une seule fois par tache (dueDateNotifiedAt sert de garde-fou).
 */
cron.schedule("0 8 * * *", async () => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const duePosts = await ReminderPost.find({
      amount: { $ne: null },
      dueDate: { $ne: null, $lte: endOfToday },
      dueDateNotifiedAt: null,
      status: { $ne: "done" },
    });

    for (const post of duePosts) {
      const amountLabel = typeof post.amount === "number" ? `${post.amount.toFixed(2)} €` : "";
      const dueDateLabel = post.dueDate ? post.dueDate.toLocaleDateString("fr-FR") : "";

      sendReminderEmails(
        `Echeance : ${post.title}`,
        [
          `Le rappel "${post.title}"${amountLabel ? ` (${amountLabel})` : ""} arrive a echeance le ${dueDateLabel}.`,
          post.body ? `Notes : ${post.body}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );

      post.dueDateNotifiedAt = new Date();
      await post.save();
    }
  } catch (error) {
    logger.error("Echec du job cron des echeances de rappels", { error });
  }
});

/************************************ Get All Posts ************************************/
const getPosts = async (_req: AuthRequest, res: Response): Promise<void> => {
  const posts = await ReminderPost.find().sort({ sortOrder: "asc", createdAt: "asc" });
  sendSuccess(res, { posts }, "Rappels recuperes avec succes");
};

/************************************ Create New ReminderPost ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, body, priorityColor = 0, status, dueDate, dueTime, amount } = req.body;

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
    dueTime: dueTime || null,
    amount: amount ?? null,
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
  const { title, body, priorityColor = 0, status, dueDate, dueTime, amount, sortOrder } = req.body;

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

  const nextDueDate = dueDate ? new Date(dueDate) : null;
  const dueDateChanged =
    (post.dueDate ? post.dueDate.getTime() : null) !== (nextDueDate ? nextDueDate.getTime() : null);

  await post.updateOne({
    title,
    body,
    priorityColor,
    status,
    dueDate: nextDueDate,
    dueTime: dueTime || null,
    amount: amount ?? null,
    sortOrder: sortOrder ?? post.sortOrder,
    // Une echeance modifiee doit pouvoir redeclencher un email, meme si l'ancienne date avait deja notifie
    ...(dueDateChanged ? { dueDateNotifiedAt: null } : {}),
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
