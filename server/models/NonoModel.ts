import mongoose, { Schema, Model } from "mongoose";
import { INono } from "../types/index.js";

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";

const NonoSchema = new Schema<INono>(
  {
    birthDate: {
      type: String,
      default: DEFAULT_NONO_BIRTH_DATE,
    },
    checkupDate: {
      type: String,
      default: "",
    },
    checkupReminder: {
      type: String,
      default: "",
    },
    vaccineDate: {
      type: String,
      default: "",
    },
    vaccineReminder: {
      type: String,
      default: "",
    },
    vitaminReminder: {
      type: String,
      default: "",
    },
    administrativeReminder: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    bottleEntries: {
      type: [
        {
          timestamp: {
            type: String,
            required: true,
          },
          amountMl: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    diaperEntries: {
      type: [
        {
          timestamp: {
            type: String,
            required: true,
          },
          hasPoop: {
            type: Boolean,
            required: true,
          },
        },
      ],
      default: [],
    },
    weightEntries: {
      type: [
        {
          date: {
            type: String,
            required: true,
          },
          weightKg: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const NonoModel: Model<INono> = mongoose.model<INono>("Nono", NonoSchema);

export default NonoModel;
