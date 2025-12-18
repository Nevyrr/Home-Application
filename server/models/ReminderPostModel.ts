import mongoose, { Schema, Model } from "mongoose";
import { IReminderPost } from "../types/index.js";

// Creating reminder post schema using Mongoose Schema class
const ReminderPostSchema = new Schema<IReminderPost>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    username: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    priorityColor: {
        type: Number,
        required: true
    }
}, { timestamps: true })


// Creating a model from schema
const ReminderPost: Model<IReminderPost> = mongoose.model<IReminderPost>("ReminderPost", ReminderPostSchema);

export default ReminderPost;

