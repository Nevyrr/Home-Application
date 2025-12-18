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
import { validate } from "../utils/validation.js";
import { shoppingPostSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

router.get("/", asyncHandler(getPosts));
router.post("/", auth, validate(shoppingPostSchema), asyncHandler(addPost));
router.post("/date", auth, asyncHandler(addDate));
router.put("/date", auth, asyncHandler(updateDateItem));
router.delete("/:id", auth, asyncHandler(deletePost));
router.delete("/list/:id", auth, asyncHandler(deletePosts));
router.put("/:id", auth, validate(shoppingPostSchema), asyncHandler(updatePost));

export { router as ShoppingPostsRoutes };

