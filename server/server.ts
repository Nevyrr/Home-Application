import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ShoppingPostsRoutes } from "./routes/ShoppingPostsRoutes.js";
import { CalendarEventsRoutes } from "./routes/CalendarEventsRoutes.js";
import { UsersRoutes } from "./routes/UsersRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { ReminderPostsRoutes } from "./routes/ReminderPostsRoutes.js";
import { TacoRoutes } from "./routes/TacoRoutes.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Initializing Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? process.env.FRONTEND_URL || "http://localhost:5173"
      : "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Middleware to receive JSON (limite de taille pour sécurité)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/reminder-posts", ReminderPostsRoutes);
app.use("/api/taco", TacoRoutes);
app.use("/api/users", UsersRoutes);

// Serve static files from React app
app.use(express.static(path.join(dirname, "/client/dist")));
app.get("*", (_req: Request, res: Response) => res.sendFile(path.join(dirname, "/client/dist/index.html")));

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

// Connecting to MongoDB using Mongoose
mongoose
  .connect(env.DB_URI, { dbName: "home_app" })
  .then(() => {
    logger.info("Connected to DB successfully");
    const port = parseInt(env.PORT, 10);
    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database", { error: err });
    process.exit(1);
  });

