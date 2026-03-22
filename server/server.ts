import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { ShoppingPostsRoutes } from "./routes/ShoppingPostsRoutes.js";
import { CalendarEventsRoutes } from "./routes/CalendarEventsRoutes.js";
import { UsersRoutes } from "./routes/UsersRoutes.js";
import { ReminderPostsRoutes } from "./routes/ReminderPostsRoutes.js";
import { TacoRoutes } from "./routes/TacoRoutes.js";
import { NonoRoutes } from "./routes/NonoRoutes.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const jsonParser = express.json({ limit: "10mb" });
const urlEncodedParser = express.urlencoded({ extended: true, limit: "10mb" });

const shouldSkipBodyParsing = (req: Request): boolean =>
  (req.headers["content-type"] || "").includes("multipart/form-data");

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
        connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com", "https://www.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
  })
);

app.use(
  cors({
    origin: env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "http://localhost:5173" : "http://localhost:5173",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Trop de requetes depuis cette IP, veuillez reessayer plus tard.",
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  },
});

app.use("/api/", limiter);

app.use((req, res, next) => {
  if (shouldSkipBodyParsing(req)) {
    return next();
  }

  jsonParser(req, res, next);
});

app.use((req, res, next) => {
  if (shouldSkipBodyParsing(req)) {
    return next();
  }

  urlEncodedParser(req, res, next);
});

app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/reminder-posts", ReminderPostsRoutes);
app.use("/api/taco", TacoRoutes);
app.use("/api/nono", NonoRoutes);
app.use("/api/users", UsersRoutes);

const clientDistPath = path.join(path.dirname(dirname), "client/dist");

app.use(express.static(clientDistPath));
app.get("*", (_req: Request, res: Response) => res.sendFile(path.join(clientDistPath, "index.html")));

app.use(errorHandler);

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
