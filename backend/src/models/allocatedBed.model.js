import mongoose, { Schema } from "mongoose";

const allocatedBedSchema = new Schema({
  bedNumber: {
    type: String,
    required: true,
  },
  patientEmail: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true,
  },
  ward_id: {
    type: Schema.Types.ObjectId,
    ref: "Ward",
  },
});

export const Allocated_bed = mongoose.model("Allocated_bed", allocatedBedSchema);
