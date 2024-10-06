import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  
});

export const Doctor = mongoose.model("Doctor", doctorSchema);
