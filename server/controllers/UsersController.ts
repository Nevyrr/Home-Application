import type { Request, Response } from "express";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { AuthRequest } from "../middlewares/auth.js";

/************************************ Creating JWT token ************************************/
const createToken = (_id: string): string => {
  // Creating a new signature
  return jwt.sign({ _id }, process.env.SECRET as string, { expiresIn: "20d" });
};

/************************************ Register User ************************************/
const registerUser = async (req: Request, res: Response): Promise<void> => {
  // Grab data from request body
  const { name, email, password } = req.body;

  // Check the fields are not empty
  if (!name || !email || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  // Check if name already exists
  const nameExist = await User.findOne({ name });
  if (nameExist) {
    res.status(400).json({ error: "Name is already taken" });
    return;
  }

  // Check if email already exists
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    res.status(400).json({ error: "Email is already taken" });
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    // Register the user
    const user = await User.create({ name, email, password: hashed, receiveEmail: false, isAdmin: false });
    // Create the JsonWebToken
    const token = createToken(user._id.toString());
    // Send the response
    res.status(200).json({ name, email, token });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Login User ************************************/
const loginUser = async (req: Request, res: Response): Promise<void> => {
  // Grab data from request body
  const { email, password } = req.body;

  // Check the fields are not empty
  if (!email || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ error: "Incorrect email" });
    return;
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400).json({ error: "Incorrect password" });
    return;
  }

  try {
    res.status(200).json({ name: user.name, email, token: createToken(user._id.toString()), receiveEmail: user.receiveEmail, isAdmin: user.isAdmin });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

/************************************ Update User ************************************/
const updateUser = async (req: Request, res: Response): Promise<void> => {
  // Grab data from request body
  const { name, email, password, receiveEmail } = req.body;

  const updateFields: { name?: string; email?: string; password?: string; receiveEmail?: boolean } = {};

  if (name) {
    updateFields.name = name;
  }
  if (email) {
    updateFields.email = email;
  }
  if (password) {
    const salt = await bcrypt.genSalt();
    updateFields.password = await bcrypt.hash(password, salt);
  }
  if (receiveEmail !== undefined) {
    updateFields.receiveEmail = receiveEmail;
  }

  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: updateFields }
    );
    res.status(200).json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};


export { registerUser, loginUser, updateUser };

