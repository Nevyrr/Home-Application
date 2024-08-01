import mongoose from "mongoose";

// Creating post schema using Mongoose Schema class
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    receiveEmail: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

// Creating a model from schema
const User = mongoose.model("User", UserSchema);

export default User;
