import mongoose from "mongoose";

// Creating post schema using Mongoose Schema class
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
    priorityColor: {
        type: Number,
        required: true,
    },
    imageURL: {
        type: String,
        required: false,
    }
}, { timestamps: true })


// Creating a model from schema
const ShoppingPost = mongoose.model("ShoppingPost", ShoppingPostSchema)

export default ShoppingPost