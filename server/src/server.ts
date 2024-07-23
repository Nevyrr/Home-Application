import express from "express";
import mongoose from "mongoose";
import { ShoppingPostsRoutes } from "./routes/ShoppingPostsRoutes";
import { CalendarEventsRoutes } from "./routes/CalendarEventsRoutes";
import { UsersRoutes } from "./routes/UsersRoutes";
import path from 'path'
import { fileURLToPath } from "url";

const filename: string = fileURLToPath(import.meta.url);
const dirname: string = path.dirname(filename);

// Initializing Express app
const app = express();

// Middleware to receive JSON
app.use(express.json());

// Adding the API end-points and the route handlers
app.use("/api/shopping-posts", ShoppingPostsRoutes);
app.use("/api/calendar-events", CalendarEventsRoutes);
app.use("/api/users", UsersRoutes);

// Use the client app
app.use(express.static(path.join(dirname, '/client/dist')));
app.get('*', (_req, res) => res.sendFile(path.join(dirname, '/client/dist/index.html')))

// Connecting to MongoDB using Mongoose
mongoose
  .connect(process.env.DB_URI ?? "", { dbName: "home_app" })
  .then(() => {
    console.log("connected to DB successfully");
    
    // Listening to requests if DB connection is successful
    app.listen(4000, () => console.log("Listening to port 4000"));
  })
  .catch((err) => console.log(err));
