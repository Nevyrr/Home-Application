import type { Request, Response } from "express";
import mongoose from "mongoose";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";

/************************************ Get All Posts ************************************/
const getPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Grab all the posts from DB
    const posts = await ReminderPost.find().sort({ priorityColor: "desc" });
    res.status(200).json({ posts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Create New ReminderPost ************************************/
const addPost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { title, body, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
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
    // Create a new post and save in DB
    const post = await ReminderPost.create({ user: user._id, username: user.name, title, body, priorityColor });

    res.status(200).json({ success: title + " reminder post created", post });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Delete ReminderPost ************************************/
const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "Incorrect ID" });
    return;
  }

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    res.status(400).json({ error: "Reminder post not found" });
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

  if (!post.user.equals(user._id) && !user.isAdmin) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  try {
    await post.deleteOne();
    res.status(200).json({ success: post.title + " reminder post was deleted" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Update ReminderPost ************************************/
const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab the data from request body
  const { title, body, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
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

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    res.status(400).json({ error: "reminder post not found" });
    return;
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (!post.user.equals(user._id) && !user.isAdmin) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  try {
    await post.updateOne({ title: title, body: body, priorityColor: priorityColor });
    res.status(200).json({ success: title + " reminder post was updated", post });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

export { getPosts, addPost, deletePost, updatePost };

