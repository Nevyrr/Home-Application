import mongoose from "mongoose";
import ReminderPost from "../models/ReminderPostModel.js";
import User from "../models/UserModel.js";

/************************************ Get All Posts ************************************/
const getPosts = async (req, res) => {
  try {
    // Grab all the posts from DB
    const posts = await ReminderPost.find().sort({ createdAt: "desc" });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Get User's Posts ************************************/
const getUserPosts = async (req, res) => {
  // Grab the authenticated user from request object
  const user = await User.findById(req.user._id);

  try {
    // Grab user's posts from DB
    const userPosts = await ReminderPost.find({ user: user._id }).sort({ createdAt: "desc" });
    res.status(200).json({ name: user.name, email: user.email, userPosts });
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

    res.status(200).json({ success: "Post created.", post });
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
    return res.status(400).json({ error: "ReminderPost not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!post.user.equals(user._id)) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await post.deleteOne();
    res.status(200).json({ success: "ReminderPost was deleted." });
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
    return res.status(400).json({ error: "ReminderPost not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!post.user.equals(user._id)) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await post.updateOne({ title: title, body: body, priorityColor: priorityColor });
    res.status(200).json({ success: "ReminderPost was updated.", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getPosts, getUserPosts, addPost, deletePost, updatePost };
