import express from "express";
import mongoose from "mongoose";
import { ShoppingPostsRoutes } from "./routes/ShoppingPostsRoutes.js";
import { CalendarEventsRoutes } from "./routes/CalendarEventsRoutes.js";
import { UsersRoutes } from "./routes/usersRoutes.js";
import path from 'path'
import { fileURLToPath } from "url";
import { ReminderPostsRoutes } from "./routes/ReminderPostsRoutes.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Initializing Express app
const app = express();

// Middleware to receive JSON
app.use(express.json());

// Adding the API end-points and the route handlers
app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/reminder-posts", ReminderPostsRoutes);
app.use("/api/users", UsersRoutes);

// Use the client app
app.use(express.static(path.join(dirname, '/client/dist')));
app.get('*', (_req, res) => res.sendFile(path.join(dirname, '/client/dist/index.html')))

// Connecting to MongoDB using Mongoose
mongoose
  .connect(process.env.DB_URI, { dbName: "home_app" })
  .then(() => {
    console.log("connected to DB successfully");
    
    // Listening to requests if DB connection is successful
    app.listen(4000, () => console.log("Listening to port 4000"));
  })
  .catch((err) => console.log(err));
