import type { Request, Response } from "express";
import mongoose from "mongoose";
import ShoppingDay from "../models/ShoppingPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendNotFound } from "../utils/apiResponse.js";

/************************************ Get All Posts ************************************/

// Extract string to "DD/MM/YYYY"
const parseDateComponents = (dateStr: string): { day: number; month: number; year: number } => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return { day, month, year };
};

// Compare 2 dates and return the oldest one
const compareDates = (post1: { date: string }, post2: { date: string }): number => {
  const { day: d1, month: m1, year: y1 } = parseDateComponents(post1.date);
  const { day: d2, month: m2, year: y2 } = parseDateComponents(post2.date);

  if (y1 !== y2) return y1 - y2; // Compare years
  if (m1 !== m2) return m1 - m2; // Compare months
  return d1 - d2; // Compare days
};

const getPosts = async (_req: Request, res: Response): Promise<void> => {
  // Grab all the posts from DB
  const posts = await ShoppingDay.find();
  posts.sort(compareDates);
  for (const post of posts) {
    post.shoppingList.sort((a, b) => b.priorityColor - a.priorityColor);
  }
  sendSuccess(res, { posts }, "Listes de courses récupérées avec succès");
};


/************************************ Create New Shopping Day ************************************/
const addDate = async (req: Request, res: Response): Promise<void> => {
  // Grab the data from request body
  const { date, name } = req.body;

  // Check the fields are not empty
  if (!date || !name) {
    throw createError("Date et nom sont requis", 400);
  }

  const shoppingDay = await ShoppingDay.create({ date, name, shoppingList: [] });
  sendCreated(res, { shoppingDay }, `Date de course "${date}" créée avec succès`);
};

/************************************ Update Shopping Day ************************************/
const updateDateItem = async (req: Request, res: Response): Promise<void> => {
  // Grab the data from request body
  const { shoppingListId, name, date } = req.body;

  // Check the fields are not empty
  if (!name || !date || !shoppingListId) {
    throw createError("Nom, date et ID de la liste sont requis", 400);
  }

  const updatedShoppingDay = await ShoppingDay.findByIdAndUpdate(
    shoppingListId,
    { name, date },
    { new: true }
  );
  if (!updatedShoppingDay) {
    throw createError("Liste de courses non trouvée", 404);
  }
  sendUpdated(res, { shoppingDay: updatedShoppingDay }, `Liste "${name}" mise à jour avec succès`);
};


/************************************ Create New Shopping Post ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { shoppingListId, title, count, unit, priorityColor } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  // find shoppingDayList
  const shoppingDayList = await ShoppingDay.findOne({ _id: shoppingListId });

  if (!shoppingDayList) {
    throw createError("Liste de courses non trouvée", 404);
  }

  const shoppingDay = {
    user: user._id,
    username: user.name,
    title,
    count,
    unit,
    priorityColor
  };

  shoppingDayList.shoppingList.push(shoppingDay);
  await shoppingDayList.save();

  sendCreated(res, { shoppingPost: shoppingDay }, `Article "${title}" ajouté avec succès`);
};

/************************************ Delete Shopping Post ************************************/
const deletePost = async (req: Request, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (!shoppingDayList) {
    throw createError("Liste de courses non trouvée", 404);
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    throw createError("Article de course non trouvé", 404);
  }

  shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
  if (shoppingDayList.shoppingList.length > 0) {
    await shoppingDayList.save();
  } else {
    await shoppingDayList.deleteOne();
  }
  sendDeleted(res, "Article supprimé avec succès");
};

/************************************ Delete All Shopping Posts ************************************/
const deletePosts = async (req: Request, res: Response): Promise<void> => {
  const deleted = await ShoppingDay.deleteOne({ _id: req.params.id });
  if (deleted.deletedCount === 0) {
    throw createError("Liste de courses non trouvée", 404);
  }
  sendDeleted(res, "Tous les articles de cette date ont été supprimés");
};

/************************************ Update Shopping Post ************************************/
const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body (validation déjà faite par le middleware)
  const { title, count, unit, priorityColor } = req.body;

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw createError("ID incorrect", 400);
  }

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (!shoppingDayList) {
    throw createError("Liste de courses non trouvée", 404);
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    throw createError("Article de course non trouvé", 404);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  const shoppingDay = {
    id: req.params.id,
    user: user._id,
    username: user.name,
    title,
    count,
    unit,
    priorityColor
  };

  shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
  shoppingDayList.shoppingList.push(shoppingDay as any);
  await shoppingDayList.save();
  const updatedShoppingDay = await ShoppingDay.findById(shoppingDayList._id);
  sendUpdated(res, { shoppingPost: shoppingDay, shoppingDay: updatedShoppingDay }, `Article "${title}" mis à jour avec succès`);
};

export { getPosts, addDate, updateDateItem, addPost, deletePost, deletePosts, updatePost };

