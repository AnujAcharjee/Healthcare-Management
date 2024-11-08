import mongoose, { Schema } from "mongoose";

const OPDSchema = new Schema({
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
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
