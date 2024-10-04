import mongoose from "mongoose";

// sub schema -- controller in doctor/ hospital section
const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    symptoms: {
      type: String,
    },
    diagnosedCondition: {
      type: String,
      required: true,
    },
    medicinesPrescribed: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        },
        dosage: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// sub schema -- controller hospital section / lab / patient
const labTestSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: true,
    },
    testType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    uploadedFile: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

//sub schema  -- controller patient section
const otherReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    uploadedFile: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// main schema
const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  prescriptions: [prescriptionSchema],
  labTestReports: [labTestSchema],
  otherReports: [otherReportSchema],
});

export const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);
