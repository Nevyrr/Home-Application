import express from "express";
import {
  getPosts,
  addPost,
  deletePost,
  updatePost,
  reorderPosts,
} from "../controllers/ReminderPostsController.js";
import auth from "../middlewares/auth.js";
import { validate } from "../utils/validation.js";
import { reminderPostSchema, reminderReorderSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getPosts));
router.patch("/reorder", auth, validate(reminderReorderSchema), asyncHandler(reorderPosts));
router.post("/", auth, validate(reminderPostSchema), asyncHandler(addPost));
router.delete("/:id", auth, asyncHandler(deletePost));
router.put("/:id", auth, validate(reminderPostSchema), asyncHandler(updatePost));

export { router as ReminderPostsRoutes };

