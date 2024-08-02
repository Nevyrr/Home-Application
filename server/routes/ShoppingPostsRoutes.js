import express from "express";
import {
  getPosts,
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

// Delete post route
router.delete("/:id", auth, deletePost);

// Delete posts route
router.delete("/", auth, deletePosts);

// Update post route
router.put("/:id", auth, updatePost);

export { router as ShoppingPostsRoutes };
