import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["pieces", "ml", "liters", "grams", "kilograms"], 
    },
    expiryDate: {
      type: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    supplier: {
      name: {
        type: String,
      },
      contact: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["available", "out of stock", "expired"],
      default: "available",
    },
  }, 
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
