import mongoose from "mongoose";
import ShoppingPost, { IShoppingPost } from "../models/ShoppingPostModel.js";
import User, { IUser } from "../models/UserModel.js";
import { Request, Response } from "express";

/************************************ Get All Posts ************************************/
const getPosts = async (req: Request, res: Response) => {
  try {
    // Grab all the posts from DB
    const posts: Array<IShoppingPost> = await ShoppingPost.find();
    res.status(200).json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Get User's Posts ************************************/
const getUserPosts = async (req: Request, res: Response) => {
  // Grab the authenticated user from request object

  const user = await User.findById(req.user?._id);
  if (user === null) {
    res.status(500).json({ error: "no user found" });
    return;
  }

  try {
    // Grab user's posts from DB
    const userPosts = await ShoppingPost.find({ user: user._id }).sort({ createdAt: "desc" });
    res.status(200).json({ name: user.name, email: user.email, userPosts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Create New ShoppingPost ************************************/
const addPost = async (req: Request, res: Response) => {
  // Grab the data from request body
  const { title, body } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user?._id);
  if (user === null) {
    res.status(500).json({ error: "no user found" });
    return;
  }

  try {
    // Create a new post and save in DB
    const post = await ShoppingPost.create({ user: user._id, username: user.name, title, body });

    res.status(200).json({ success: "Post created.", post });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/************************************ Delete ShoppingPost ************************************/
const deletePost = async (req: Request, res: Response) => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const postDoc = await ShoppingPost.findById(req.params.id);
  if (postDoc === null) {
    return res.status(400).json({ error: "ShoppingPost not found" });
  }
  
  const post: IShoppingPost = postDoc.toObject() as IShoppingPost;

  // Check the user owns the post
  const userPost = await User.findById(req.user?._id).exec();
  if (userPost === null) {
    res.status(500).json({ error: "no user found" });
    return;
  }

  const user: IUser = userPost.toObject() as IUser;

  if (!post.user.equals(user._id)) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await postDoc.deleteOne();
    res.status(200).json({ success: "ShoppingPost was deleted." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Update ShoppingPost ************************************/
const updatePost = async (req: Request, res: Response) => {
  // Grab the data from request body
  const { title, body } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const postDoc: mongoose.Document<IShoppingPost> | null = await ShoppingPost.findById(req.params.id);
  if (postDoc === null) {
    return res.status(400).json({ error: "ShoppingPost not found" });
  }

  const post: IShoppingPost = postDoc.toObject() as IShoppingPost;

  const userPost = await User.findById(req.user?._id).exec();
  if (userPost === null) {
    res.status(500).json({ error: "no user found" });
    return;
  }

  const user: IUser = userPost.toObject() as IUser;
  
  if (user === undefined) {
    res.status(500).json({ error: "no user found" });
    return;
  }

  if (!post.user.equals(user._id)) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await postDoc.updateOne({ title, body });
    res.status(200).json({ success: "ShoppingPost was updated.", post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { getPosts, getUserPosts, addPost, deletePost, updatePost };
