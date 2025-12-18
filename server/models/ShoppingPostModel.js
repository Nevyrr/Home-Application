import mongoose from "mongoose";

// Creating shopping post schema using Mongoose Schema class
const ShoppingPostSchema = new mongoose.Schema({
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
    count: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: false
    },
    priorityColor: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const ShoppingListDaySchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    shoppingList: {
        type: [ShoppingPostSchema],
        required: true,
        default: []
    },
}, { timestamps: true });


// Creating a model from schema
const ShoppingDay = mongoose.model("ShoppingDay", ShoppingListDaySchema);

export default ShoppingDay;