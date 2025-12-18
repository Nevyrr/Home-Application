import mongoose, { Schema, Model } from "mongoose";
import { ITaco } from "../types/index.js";

// Creating Taco schema using Mongoose Schema class
const TacoSchema = new Schema<ITaco>({
    vermifugeDate: {
        type: String,
        required: true
    },
    vermifugeReminder: {
        type: String,
        required: true
    },
    antiPuceDate: {
        type: String,
        required: true
    },
    antiPuceReminder: {
        type: String,
        required: true
    },
}, { timestamps: true });


// Creating a model from schema
const TacoModel: Model<ITaco> = mongoose.model<ITaco>("Taco", TacoSchema);

export default TacoModel;

