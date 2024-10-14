import mongoose, { Schema } from "mongoose";
import {
  hashPassword,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/auth.js";

const doctorSchema = new Schema({
  email: {
    type: String,
    unique: true,
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
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  avatar: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  userType: {
    type: String,
    default: "Doctor",
  },
});

doctorSchema.pre("save", hashPassword);

// Add methods to the schema
doctorSchema.methods.isPasswordCorrect = isPasswordCorrect;
doctorSchema.methods.generateAccessToken = generateAccessToken;
doctorSchema.methods.generateRefreshToken = generateRefreshToken;

export const Doctor = mongoose.model("Doctor", doctorSchema);
