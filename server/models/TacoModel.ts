import mongoose, { Schema, Model } from "mongoose";
import { ITaco } from "../types/index.js";

// Creating Taco schema using Mongoose Schema class
const TacoSchema = new Schema<ITaco>({
    vermifugeDate: {
        type: String,
        default: ""
    },
    vermifugeReminder: {
        type: String,
        default: ""
    },
    antiPuceDate: {
        type: String,
        default: ""
    },
    antiPuceReminder: {
        type: String,
        default: ""
    },
    annualVaccineDate: {
        type: String,
        default: ""
    },
    annualVaccineReminder: {
        type: String,
        default: ""
    },
    vermifugeIntervalMonths: { type: Number, default: null, min: 1, max: 1200, validate: (value: number | null) => value === null || Number.isInteger(value) },
    antiPuceIntervalMonths: { type: Number, default: null, min: 1, max: 1200, validate: (value: number | null) => value === null || Number.isInteger(value) },
    annualVaccineIntervalMonths: { type: Number, default: null, min: 1, max: 1200, validate: (value: number | null) => value === null || Number.isInteger(value) },
    birthDate: {
        type: String,
        default: "07/08/2022"
    },
    weightKg: {
        type: Number,
        default: 16.7
    },
}, { timestamps: true });


// Creating a model from schema
const TacoModel: Model<ITaco> = mongoose.model<ITaco>("Taco", TacoSchema);

export default TacoModel;

