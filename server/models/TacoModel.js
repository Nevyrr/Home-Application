import mongoose from "mongoose";

// Creating Taco schema using Mongoose Schema class
const TacoSchema = new mongoose.Schema({
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
const TacoModel = mongoose.model("Taco", TacoSchema);

export default TacoModel;