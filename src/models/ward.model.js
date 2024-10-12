import mongoose, { Schema } from "mongoose";

const wardSchema = new Schema({
  name: {
    type: String,
    unique: false,
    required: true,
  },
  totalBedNum: {
    type: Number,
    required: true,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
});

export const Ward = mongoose.model("Ward", wardSchema);
