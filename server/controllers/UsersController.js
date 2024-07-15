import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

/************************************ Creating JWT token ************************************/
const createToken = (_id) => {
  // Creating a new signature
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "10d" });
};

/************************************ Register User ************************************/
const registerUser = async (req, res) => {
  // Grab data from request body
  const { name, email, password } = req.body;

  // Check the fields are not empty
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email already exist
  const nameExist = await User.findOne({ name });
  if (nameExist) {
    return res.status(400).json({ error: "name is already taken" });
  }

  // Check if email already exist
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).json({ error: "Email is already taken" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    // Register the user
    const user = await User.create({ name, email, password: hashed });
    // Create the JsonWebToken
    const token = createToken(user._id)
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

  // Check if email already exist
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Incorrect email." });
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Incorrect password." });
  }

  try {
    // Create the JsonWebToken
    const token = createToken(user._id)
    const name = user.name

    res.status(200).json({name, email, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { registerUser, loginUser };
