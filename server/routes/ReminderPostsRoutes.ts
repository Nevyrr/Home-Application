import express from "express";
import {
  getPosts,
  addPost,
  deletePost,
  updatePost,
  reorderPosts,
} from "../controllers/ReminderPostsController.js";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import { validate } from "../utils/validation.js";
import { reminderPostSchema, reminderReorderSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getPosts));
router.patch("/reorder", auth, requireWritable, validate(reminderReorderSchema), asyncHandler(reorderPosts));
router.post("/", auth, requireWritable, validate(reminderPostSchema), asyncHandler(addPost));
router.delete("/:id", auth, requireWritable, asyncHandler(deletePost));
router.put("/:id", auth, requireWritable, validate(reminderPostSchema), asyncHandler(updatePost));

export { router as ReminderPostsRoutes };

