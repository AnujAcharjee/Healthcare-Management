import mongoose, { Schema } from "mongoose";
import {
  hashPassword,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/auth.js";

const hospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: "true",
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      state: String,
      city: String,
      zip: String,
    },
    ownership: {
      type: String,
      lowercase: true,
      enum: ["government", "private"],
      required: "true",
    },
    coverImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    departments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    doctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    refreshToken: {
      type: String,
    },
    userType: {
      type: String,
      default: "Hospital",
    },
    // allocatedBeds: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Bed",
    //   },
    // ],
    // allOPDs: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "OPDAppointment",
    //   },
    // ],
    // inventory_items: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Inventory",
    //   },
    // ],
  },
  { timestamps: true }
);

hospitalSchema.pre("save", hashPassword);

// Add methods to the schema
hospitalSchema.methods.isPasswordCorrect = isPasswordCorrect;
hospitalSchema.methods.generateAccessToken = generateAccessToken;
hospitalSchema.methods.generateRefreshToken = generateRefreshToken;

export const Hospital = mongoose.model("Hospital", hospitalSchema);
