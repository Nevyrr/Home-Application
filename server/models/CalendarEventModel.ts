import mongoose, { Schema, Model } from "mongoose";
import { ICalendarEvent } from "../types/index.js";

// Creating calendar event schema using Mongoose Schema class
const CalendarEventSchema = new Schema<ICalendarEvent>({
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
const CalendarEvent: Model<ICalendarEvent> = mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;

