import mongoose from "mongoose";

// Creating post schema using Mongoose Schema class
const ShoppingPostSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
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
    shoppingList: {
        type: [ShoppingPostSchema],
        required: true,
        default: []
    },
}, { timestamps: true });


// Creating a model from schema
const ShoppingPost = mongoose.model("ShoppingPost", ShoppingListDaySchema)

export default ShoppingPost