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

router.get("/", getPosts);
router.post("/", auth, addPost);
router.post("/date", auth, addDate);
router.put("/date", auth, updateDateItem);
router.delete("/:id", auth, deletePost);
router.delete("/list/:id", auth, deletePosts);
router.put("/:id", auth, updatePost);

export { router as ShoppingPostsRoutes };
