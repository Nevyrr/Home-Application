import mongoose from "mongoose";

// Creating calendar event schema using Mongoose Schema class
const CalendarEventSchema = new mongoose.Schema({
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
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: false
    },
    priorityColor: {
        type: Number,
        required: true
    }
}, { timestamps: true })


// Creating a model from schema
const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;