import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

/************************************ Creating JWT token ************************************/
const createToken = (_id) => {
  // Creating a new signature
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "20d" });
};

/************************************ Register User ************************************/
const registerUser = async (req, res) => {
  // Grab data from request body
  const { name, email, password } = req.body;

  // Check the fields are not empty
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if name already exists
  const nameExist = await User.findOne({ name });
  if (nameExist) {
    return res.status(400).json({ error: "Name is already taken" });
  }

  // Check if email already exists
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).json({ error: "Email is already taken" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    // Register the user
    const user = await User.create({ name, email, password: hashed, receiveEmail: false, isAdmin: false });
    // Create the JsonWebToken
    const token = createToken(user._id);
    // Send the response
    res.status(200).json({ name, email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Login User ************************************/
const loginUser = async (req, res) => {
  // Grab data from request body
  const { email, password } = req.body;

  // Check the fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Incorrect email" });
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  try {
    res.status(200).json({ name: user.name, email, token: createToken(user._id), receiveEmail: user.receiveEmail, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Update User ************************************/
const updateUser = async (req, res) => {
  // Grab data from request body
  const { name, email, password, receiveEmail } = req.body;

  const updateFields = {};

  if (name) {
    updateFields.name = name;
  }
  if (email) {
    updateFields.email = email;
  }
  if (password) {
    updateFields.password = password;
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
    res.status(500).json({ error: error.message });
  }
};


export { registerUser, loginUser, updateUser };
