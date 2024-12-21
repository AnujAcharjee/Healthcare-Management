import mongoose, { Schema } from "mongoose";

const OPDSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  appointedPatients: [
    {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  ],
});

export const OPD = mongoose.model("OPD", OPDSchema);
