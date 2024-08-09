import express from "express";
import auth from "../middlewares/auth.js";
import { handleUpload, getFile } from "../controllers/TacoController.js"

// Creating an instance of Express router
const router = express.Router();

router.get("/image/:filename", auth, getFile);
router.post("/upload", auth, handleUpload, (_, res) => {
  // After handleUpload completes, req.file should be available
  res.status(200).send('Image uploaded successfully');
});

export { router as TacoRoutes };