import mongoose, { Schema, Model } from "mongoose";
import { IShoppingDay, IShoppingPost } from "../types/index.js";

// Creating shopping post schema using Mongoose Schema class
const ShoppingPostSchema = new Schema<IShoppingPost>({
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

const ShoppingListDaySchema = new Schema<IShoppingDay>({
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
const ShoppingDay: Model<IShoppingDay> = mongoose.model<IShoppingDay>("ShoppingDay", ShoppingListDaySchema);

export default ShoppingDay;

