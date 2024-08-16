import mongoose from "mongoose";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";

/************************************ Get All Posts ************************************/
const getPosts = async (req, res) => {
  try {
    // Grab all the posts from DB
    const posts = await ReminderPost.find().sort({ priorityColor: "desc" });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Create New ReminderPost ************************************/
const addPost = async (req, res) => {
  // Grab the data from request body
  const { title, body, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  try {
    // Create a new post and save in DB
    const post = await ReminderPost.create({ user: user._id, username: user.name, title, body, priorityColor });

    res.status(200).json({ success: title +  " reminder post created.", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Delete ReminderPost ************************************/
const deletePost = async (req, res) => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ error: "r0eminder post not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!post.user.equals(user._id) && !user.isAdmin) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await post.deleteOne();
    res.status(200).json({ success: post.title + " reminder post was deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Update ReminderPost ************************************/
const updatePost = async (req, res) => {
  // Grab the data from request body
  const { title, body, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title || !body) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const post = await ReminderPost.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ error: "reminder post not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!post.user.equals(user._id) && !user.isAdmin) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await post.updateOne({ title: title, body: body, priorityColor: priorityColor });
    res.status(200).json({ success: title + " reminder post was updated.", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getPosts, addPost, deletePost, updatePost };
