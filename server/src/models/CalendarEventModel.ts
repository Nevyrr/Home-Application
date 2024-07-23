import mongoose from "mongoose";

export interface ICalendarEvent {
    user: mongoose.Schema.Types.ObjectId;
    username: string;
    title: string;
    selectedDate: string;
    priorityColor: number;
}

// Interface étendue pour inclure les méthodes
interface ICalendarEventDocument extends Document, ICalendarEvent {
    toInterface(): ICalendarEvent;
}

// Creating event schema using Mongoose Schema class
const CalendarEventSchema: mongoose.Schema = new mongoose.Schema<ICalendarEventDocument>({
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
    selectedDate: {
        type: String,
        required: true
    },
    priorityColor: {
        type: Number,
        required: true
    }
}, { timestamps: true })


// Creating a model from schema
const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;