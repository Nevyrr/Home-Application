import mongoose from "mongoose";
import CalendarEvent from "../models/CalendarEventModel.js";
import User from "../models/UserModel.js";

/************************************ Get All Events ************************************/
const getEvents = async (_req, res) => {
  try {
    // Grab all the events from DB
    const posts = await CalendarEvent.find().sort({ priorityColor: "desc" });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/************************************ Create New Calendar Event ************************************/
const addEvent = async (req, res) => {
  // Grab the data from request body
  const { title, date, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  } else if (!date) {
    return res.status(400).json({ error: "Date need to be selected" })
  } else if (priorityColor === undefined) {
    return res.status(400).json({ error: "Priority Color need to be selected" })
  }

  // Find the authenticated user using the user id provided by request object
  const user = await User.findById(req.user._id);

  try {
    // Create a new Event and save in DB
    const event = await CalendarEvent.create({ user: user._id, username: user.name, title: title, date: date, priorityColor: priorityColor });

    res.status(200).json({ success: title + " event created.", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Delete Calendar Events ************************************/
const deleteEvent = async (req, res) => {
  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    return res.status(400).json({ error: "calendar event not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!event.user.equals(user._id) && !user.isAdmin) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await event.deleteOne();
    res.status(200).json({ success: event.title + " calendar event was deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Update Calendar Events ************************************/
const updateEvent = async (req, res) => {
  // Grab the data from request body
  const { title, date, priorityColor } = req.body;

  // Check the fields are not empty
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Check the fields are not empty
  if (date === undefined) {
    return res.status(400).json({ error: "Date is required" });
  }

  // Check the fields are not empty
  if (priorityColor === undefined) {
    return res.status(400).json({ error: "Priority Color is required" });
  }

  // Check the ID is valid type
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Incorrect ID" });
  }

  // Check the post exists
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    return res.status(400).json({ error: "calendar event not found" });
  }

  // Check the user owns the post
  const user = await User.findById(req.user._id);
  if (!event.user.equals(user._id) && !user.isAdmin) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    await event.updateOne({ title: title, date: date, priorityColor: priorityColor });
    res.status(200).json({ success: title + " calendar event was updated.", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getEvents, addEvent, deleteEvent, updateEvent };
