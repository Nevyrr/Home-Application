import mongoose, { Schema, Model } from "mongoose";

export interface IImage extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    data: Buffer;
    createdAt?: Date;
    updatedAt?: Date;
}

const ImageSchema = new Schema<IImage>({
    filename: {
        type: String,
        required: true,
        unique: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    }
}, { timestamps: true });

const ImageModel: Model<IImage> = mongoose.model<IImage>("Image", ImageSchema);

export default ImageModel;

