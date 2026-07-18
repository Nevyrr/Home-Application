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
    googleId: {
      // Pas de "default: null" : un index sparse unique n'ignore que les documents ou le
      // champ est absent, pas ceux ou il vaut explicitement null. Avec un default a null,
      // le 2e compte cree sans Google (email/mdp) entrait en conflit avec le 1er sur cet
      // index et l'inscription echouait avec "googleId est deja utilise".
      type: String,
      unique: true,
      sparse: true,
    },
    receiveEmail: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    accessLevel: {
      type: String,
      enum: ["writable", "readonly"],
      default: "readonly",
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
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

