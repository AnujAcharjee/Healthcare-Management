import mongoose, { Schema } from "mongoose";

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

export const Doctor = mongoose.model("Doctor", doctorSchema);
