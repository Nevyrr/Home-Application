import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/index.js";

// Creating user schema using Mongoose Schema class
const UserSchema = new Schema<IUser>(
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
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Creating a model from schema
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;

