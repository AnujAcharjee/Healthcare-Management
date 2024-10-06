import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  headDoctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: Hospital,
    required: true,
  },
  wards: [
    {
      name: {
        type: String,
        required: true,
      },
      totalBeds : {
        type: Number,
        required: true,
      },
    },
  ],
});

export const Department = mongoose.model("Department", departmentSchema);
