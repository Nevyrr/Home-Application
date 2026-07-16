import express from "express";
import rateLimit from "express-rate-limit";
import {
  getPosts,
  addDate,
  updateDateItem,
  addPost,
  deletePost,
  deletePosts,
  updatePost,
  generateAiShoppingList,
} from "../controllers/ShoppingPostsController.js";
import auth from "../middlewares/auth.js";
import { requireWritable } from "../middlewares/access.js";
import { validate } from "../utils/validation.js";
import { shoppingPostSchema, shoppingPostUpdateSchema, aiShoppingRequestSchema } from "../utils/validation.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Creating an instance of Express router
const router = express.Router();

// L'IA coute reellement de l'argent par appel : limite dediee pour eviter les abus
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Trop de generations IA, veuillez reessayer plus tard.",
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  },
});

router.get("/", auth, asyncHandler(getPosts));
router.post("/", auth, requireWritable, validate(shoppingPostSchema), asyncHandler(addPost));
router.post("/date", auth, requireWritable, asyncHandler(addDate));
router.put("/date", auth, requireWritable, asyncHandler(updateDateItem));
router.delete("/:id", auth, requireWritable, asyncHandler(deletePost));
router.delete("/list/:id", auth, requireWritable, asyncHandler(deletePosts));
router.put("/:id", auth, requireWritable, validate(shoppingPostUpdateSchema), asyncHandler(updatePost));
router.post(
  "/ai-generate",
  auth,
  requireWritable,
  aiLimiter,
  validate(aiShoppingRequestSchema),
  asyncHandler(generateAiShoppingList)
);

export { router as ShoppingPostsRoutes };

