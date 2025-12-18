import mongoose from "mongoose";

// Creating reminder post schema using Mongoose Schema class
const ReminderPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
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
const ReminderPost = mongoose.model("ReminderPost", ReminderPostSchema);

export default ReminderPost;