import express from "express";
import {
  getPosts,
  addPost,
  deletePost,
  updatePost,
} from "../controllers/ReminderPostsController.js";
import auth from "../middlewares/auth.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", getPosts);
router.post("/", auth, addPost);
router.delete("/:id", auth, deletePost);
router.put("/:id", auth, updatePost);

export { router as ReminderPostsRoutes };
