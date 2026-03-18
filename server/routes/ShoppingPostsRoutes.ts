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
import { requireWritable } from "../middlewares/access.js";
import { validate } from "../utils/validation.js";
import { shoppingPostSchema, shoppingPostUpdateSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getPosts));
router.post("/", auth, requireWritable, validate(shoppingPostSchema), asyncHandler(addPost));
router.post("/date", auth, requireWritable, asyncHandler(addDate));
router.put("/date", auth, requireWritable, asyncHandler(updateDateItem));
router.delete("/:id", auth, requireWritable, asyncHandler(deletePost));
router.delete("/list/:id", auth, requireWritable, asyncHandler(deletePosts));
router.put("/:id", auth, requireWritable, validate(shoppingPostUpdateSchema), asyncHandler(updatePost));

export { router as ShoppingPostsRoutes };

