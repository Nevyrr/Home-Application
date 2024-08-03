import express from "express";
import {
  getPosts,
  addDate,
  updateDateItem,
  addPost,
  deletePost,
  deletePosts,
  updatePost
} from "../controllers/ShoppingPostsController.js";
import auth from "../middlewares/auth.js";

// Creating an instance of Express router
const router = express.Router();

// Get all posts route
router.get("/", getPosts);

// Add new post route
router.post("/", auth, addPost);

// Add new date route
router.post("/date", auth, addDate);

// Add update date route
router.put("/date", auth, updateDateItem);

// Delete post route
router.delete("/:id", auth, deletePost);

// Delete posts route
router.delete("/list/:id", auth, deletePosts);

// Update post route
router.put("/:id", auth, updatePost);

export { router as ShoppingPostsRoutes };
