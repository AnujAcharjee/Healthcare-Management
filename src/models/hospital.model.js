import mongoose from "mongoose";
import { Patient } from "./patient";
import { Inventory } from "./inventory.model";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "true",
    },
    location: {
      type: String,
      required: "true",
    },
    image: {
      filename: {
        type: String,
        default: "default_img",
      },
      url: {
        type: String,
        default:
          "https://plus.unsplash.com/premium_photo-1681995326134-cdc947934015?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) =>
          v === ""
            ? "https://plus.unsplash.com/premium_photo-1681995326134-cdc947934015?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            : v,
      },
    },
    ownership: {
      type: String,
      lowercase: true,
      enum: ["government", "private"],
      required: "true",
    },
    doctor: [

    ],
    bed: {
      count: {
        type: Number,
        required: "true",
      },
      occupied: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          default: null,
        },
      ],
    },
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to initialize the beds array (all as null) based on bedCount
hospitalSchema.pre("save", function (next) {
  if (!this.bed.status || this.bed.status.length !== this.bed.count) {
    this.bed.status = Array.from({ length: this.bed.count }, () => null);
  }
  next();
});

export const Hospital = mongoose.model("Hospital", hospitalSchema);
