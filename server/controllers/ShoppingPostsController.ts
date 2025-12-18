import type { Request, Response } from "express";
import mongoose from "mongoose";
import ShoppingDay from "../models/ShoppingPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";

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
  try {
    // Grab all the posts from DB
    const posts = await ShoppingDay.find();
    posts.sort(compareDates);
    for (const post of posts) {
      post.shoppingList.sort((a, b) => b.priorityColor - a.priorityColor);
    }
    res.status(200).json({ posts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};


/************************************ Create New Shopping Day ************************************/
const addDate = async (req: Request, res: Response): Promise<void> => {
  // Grab the data from request body
  const { date, name } = req.body;

  // Check the fields are not empty
  if (!date || !name) {
    res.status(400).json({ error: "Date and name are required" });
    return;
  }

  try {
    await ShoppingDay.create({ date: date, name: name, shoppingList: [] });
    res.status(200).json({ success: date + " shopping date created" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Update Shopping Day ************************************/
const updateDateItem = async (req: Request, res: Response): Promise<void> => {
  // Grab the data from request body
  const { shoppingListId, name, date } = req.body;

  // Check the fields are not empty
  if (!name || !date || !shoppingListId) {
    res.status(400).json({ error: "Name, date and shopping list ID are required" });
    return;
  }

  try {
    await ShoppingDay.findByIdAndUpdate(
      shoppingListId,
      { name: name, date: date }
    );
    res.status(200).json({ success: name + " shopping list updated" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};


/************************************ Create New Shopping Post ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { shoppingListId, title, count, unit, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !count || !shoppingListId || priorityColor === undefined) {
    res.status(400).json({ error: "All fields are required" });
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
    // find shoppingDayList
    const shoppingDayList = await ShoppingDay.findOne({ _id: shoppingListId });

    if (shoppingDayList === undefined || shoppingDayList === null) {
      res.status(404).json({ error: "Shopping list not found with this ID" });
      return;
    }

    const shoppingDay = {
      user: user._id,
      username: user.name,
      title: title,
      count: count,
      unit: unit,
      priorityColor: priorityColor
    };

    shoppingDayList.shoppingList.push(shoppingDay);
    await shoppingDayList.save();

    res.status(200).json({ success: title + " shopping post created" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Delete Shopping Post ************************************/
const deletePost = async (req: Request, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ msg: "Incorrect ID" });
    return;
  }

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (shoppingDayList === undefined || shoppingDayList === null) {
    res.status(404).json({ error: "Shopping list not found with this ID" });
    return;
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    res.status(404).json({ error: "Shopping post not found with this ID" });
    return;
  }

  try {
    shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
    if (shoppingDayList.shoppingList.length > 0) {
      await shoppingDayList.save();
    } else {
      await shoppingDayList.deleteOne();
    }
    res.status(200).json({ success: "Shopping post was deleted" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Delete All Shopping Posts ************************************/
const deletePosts = async (req: Request, res: Response): Promise<void> => {
  try {
    await ShoppingDay.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: "All shopping posts at this date were deleted" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Update Shopping Post ************************************/
const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { title, count, unit, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !count || priorityColor === undefined) {
    res.status(400).json({ error: "All fields are required" });
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

  const shoppingDayList = await ShoppingDay.findOne({
    shoppingList: {
      $elemMatch: { _id: req.params.id }
    }
  });

  if (shoppingDayList === undefined || shoppingDayList === null) {
    res.status(404).json({ error: "Shopping list not found with this ID" });
    return;
  }

  const shoppingPostIndex = shoppingDayList.shoppingList.findIndex((shoppingItem) => shoppingItem._id.equals(new mongoose.Types.ObjectId(req.params.id)));
  if (shoppingPostIndex === -1) {
    res.status(404).json({ error: "Shopping post not found with this ID" });
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const shoppingDay = {
    id: req.params.id,
    user: user._id,
    username: user.name,
    title: title,
    count: count,
    unit: unit,
    priorityColor: priorityColor
  };

  try {
    shoppingDayList.shoppingList.splice(shoppingPostIndex, 1);
    shoppingDayList.shoppingList.push(shoppingDay as any);
    await shoppingDayList.save();
    res.status(200).json({ success: title + " shopping post was updated" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

export { getPosts, addDate, updateDateItem, addPost, deletePost, deletePosts, updatePost };

