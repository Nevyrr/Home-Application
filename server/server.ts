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
// Désactiver certaines protections de helmet pour les uploads
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

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
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  },
});

app.use("/api/", (req, _res, next) => {
    if (req.path === '/taco/upload') {
        console.log('[SERVER] Requête POST /api/taco/upload reçue');
        console.log('[SERVER] Content-Type:', req.headers['content-type']);
    }
    next();
}, limiter);

// Middleware to receive JSON (limite de taille pour sécurité)
// IMPORTANT: Ne pas parser le body pour les routes d'upload (multer le fait)
app.use((req, res, next) => {
    // Ne JAMAIS parser le body pour les requêtes multipart/form-data (gérées par multer)
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        console.log('[SERVER] Requête multipart/form-data détectée, skip body parser');
        return next();
    }
    express.json({ limit: "10mb" })(req, res, next);
});

app.use((req, res, next) => {
    // Ne JAMAIS parser le body pour les requêtes multipart/form-data (gérées par multer)
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        return next();
    }
    express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
});

// API routes
app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/reminder-posts", ReminderPostsRoutes);
app.use("/api/taco", TacoRoutes);
app.use("/api/users", UsersRoutes);

// Serve static files from React app
// After compilation, dirname points to dist/, so we need to go up one level to access client/dist
const clientDistPath = path.join(path.dirname(dirname), "client/dist");
app.use(express.static(clientDistPath));
app.get("*", (_req: Request, res: Response) => res.sendFile(path.join(clientDistPath, "index.html")));

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

