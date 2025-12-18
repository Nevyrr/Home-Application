import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { ShoppingPostsRoutes } from "./routes/ShoppingPostsRoutes.js";
import { CalendarEventsRoutes } from "./routes/CalendarEventsRoutes.js";
import { UsersRoutes } from "./routes/UsersRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { ReminderPostsRoutes } from "./routes/ReminderPostsRoutes.js";
import { TacoRoutes } from "./routes/TacoRoutes.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Initializing Express app
const app = express();

// Middleware to receive JSON
app.use(express.json());

// API routes
app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/reminder-posts", ReminderPostsRoutes);
app.use("/api/taco", TacoRoutes);
app.use("/api/users", UsersRoutes);

// Serve static files from React app
app.use(express.static(path.join(dirname, "/client/dist")));
app.get("*", (_req, res) => res.sendFile(path.join(dirname, "/client/dist/index.html")));

// Connecting to MongoDB using Mongoose
mongoose
  .connect(process.env.DB_URI, { dbName: "home_app" })
  .then(() => {
    console.log("Connected to DB successfully");
    app.listen(4000, () => console.log("Listening to port 4000"));
  })
  .catch((err) => console.log(err));
