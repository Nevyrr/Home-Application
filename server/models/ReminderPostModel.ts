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
        default: "",
    },
    priorityColor: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo",
        required: true,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    sortOrder: {
        type: Number,
        required: true,
        default: 0,
    }
}, { timestamps: true })


// Creating a model from schema
const ReminderPost: Model<IReminderPost> = mongoose.model<IReminderPost>("ReminderPost", ReminderPostSchema);

export default ReminderPost;

