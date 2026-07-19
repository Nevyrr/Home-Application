import express from "express";
import {
  getPosts,
  addShoppingList,
  renameShoppingList,
  addPost,
  deletePost,
  deletePosts,
  updatePost,
  toggleCheckedPost,
  clearCheckedPosts,
  generateAiShoppingList,
} from "../controllers/ShoppingPostsController.js";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import { aiLimiter } from "../middlewares/aiRateLimit.js";
import { validate } from "../utils/validation.js";
import { shoppingPostSchema, shoppingPostUpdateSchema, shoppingPostCheckSchema, aiDescriptionRequestSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", auth, asyncHandler(getPosts));
router.post("/", auth, requireWritable, validate(shoppingPostSchema), asyncHandler(addPost));
router.post("/list", auth, requireWritable, asyncHandler(addShoppingList));
router.put("/list/:id", auth, requireWritable, asyncHandler(renameShoppingList));
router.delete("/:id", auth, requireWritable, asyncHandler(deletePost));
router.delete("/list/:id", auth, requireWritable, asyncHandler(deletePosts));
router.delete("/list/:id/checked", auth, requireWritable, asyncHandler(clearCheckedPosts));
router.put("/:id", auth, requireWritable, validate(shoppingPostUpdateSchema), asyncHandler(updatePost));
router.patch("/:id/check", auth, requireWritable, validate(shoppingPostCheckSchema), asyncHandler(toggleCheckedPost));
router.post(
  "/ai-generate",
  auth,
  requireWritable,
  aiLimiter,
  validate(aiDescriptionRequestSchema),
  asyncHandler(generateAiShoppingList)
);

export { router as ShoppingPostsRoutes };
