import mongoose from "mongoose";
import { Patient } from "./patient";

const opdSchema = new mongoose.Schema(
  {
    doctor: {
      type: String,
      required: true,
    },
    appointmentDate_Time: {
      type: Date,
      required: true,
    },
    patientQueue: [
      {
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "cancelled"],
          default: "pending"
        },
        time: {
            type: String,
            required: true
        }
      },
    ],
  },
  { timestamps: true }
);

export const OPD = mongoose.model("OPD", opdSchema);
