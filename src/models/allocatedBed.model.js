import mongoose, { Schema } from "mongoose";

const allocatedBedSchema = new Schema({
  // hospitalId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Hospital",
  //   required: true,
  // },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  ward: {
    type: String,
    required: true,
  },
  bedNumber: {
    type: String,
    required: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
  },
});

export const Bed = mongoose.model("Bed", allocatedBedSchema);
