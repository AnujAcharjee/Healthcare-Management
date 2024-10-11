import mongoose, { Schema } from "mongoose";
import {
  hashPassword,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/auth.js";

const patientSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    avatar: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    DOB: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    bedAllocation: {
      type: Schema.Types.ObjectId,
      ref: "Bed",
    },
    opdAppointments: [
      {
        type: Schema.Types.ObjectId,
        ref: "OPDAppointment",
      },
    ],
    refreshToken: {
      type: String,
    },
    userType: {
      type: String,
      default: "Patient",
    },
  },
  { timestamps: true }
);

patientSchema.pre("save", hashPassword);

// Add methods to the schema  --> to get the context of this
patientSchema.methods.isPasswordCorrect = isPasswordCorrect;
patientSchema.methods.generateAccessToken = generateAccessToken;
patientSchema.methods.generateRefreshToken = generateRefreshToken;

export const Patient = mongoose.model("Patient", patientSchema);
