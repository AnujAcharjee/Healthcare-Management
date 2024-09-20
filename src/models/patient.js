import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    reports: {
      type: String,
    },
    prescriptions: {
      type: String,
    },
    appointment: {
      opdID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OPD",
        default: null
      },
      token: {
        type: Number,   // it will store the arr index of opd patient queue for their respective obj id
        required: true
      }
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
