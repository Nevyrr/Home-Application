import mongoose from "mongoose";

export interface IShoppingPost extends Document {
    user: mongoose.Types.ObjectId;
    username: string;
    title: string;
    bodyText: string;
}
// Creating post schema using Mongoose Schema class
const ShoppingPostSchema: mongoose.Schema = new mongoose.Schema<IShoppingPost>({
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
    body: {
        type: String,
        required: true,
    }
}, { timestamps: true })


// Creating a model from schema
const ShoppingPost = mongoose.model("ShoppingPost", ShoppingPostSchema);

export default ShoppingPost;