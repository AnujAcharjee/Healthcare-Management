import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Patient } from "../../models/patient.model.js";
import { MedicalRecord } from "../../models/medicalRecords.model.js";

const createPrescription = asyncHandler(async (req, res) => {
  const { patientEmail, symptoms, diagnosedCondition } = req.body;

  if (
    [patientEmail, symptoms, diagnosedCondition].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^\S+@\S+\.\S+$/.test(patientEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Find patient by email
  const patient = await Patient.findOne({ email: patientEmail });
  if (!patient) {
    throw new ApiError(404, "Invalid patient email");
  }

  // Find medical records of patient and update
  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    { patientId: patient._id },
    {
      $push: {
        prescriptions: {
          doctorId: req.user?._id,
          symptoms,
          diagnosedCondition,
        },
      },
    },
    { new: true, select: "-labTestReports -otherReports" }
  );

  if (!updatedMedicalRecords) {
    throw new ApiError(500, "Error while creating prescription");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { updatedMedicalRecords },
        "Prescription created successfully"
      )
    );
});

const prescribeMedicines = asyncHandler(async (req, res) => {
  const { name, dosage, frequency, instructions } = req.body;
  const { medicalRecords_id, prescription_id } = req.params;

  if (
    [name, dosage, frequency].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!medicalRecords_id || !prescription_id) {
    throw new ApiError(
      400,
      "Medical records ID or prescription_id is missing from the URL."
    );
  }

  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    { _id: medicalRecords_id, "prescriptions._id": prescription_id },
    {
      $push: {
        "prescriptions.$.medicinesPrescribed": {
          name,
          dosage,
          frequency,
          instructions,
        },
      },
    },
    { new: true, select: "-labTestReports -otherReports" }
  );

  if (!updatedMedicalRecords) {
    throw new ApiError(500, "Error while prescribing medicines");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedMedicalRecords },
        "Medicine added successfully"
      )
    );
});

const changePrescription = asyncHandler(async (req, res) => {
  const { symptoms, diagnosedCondition } = req.body;
  const { medicalRecords_id, prescription_id } = req.params;

  if (!medicalRecords_id || !prescription_id) {
    throw new ApiError(
      400,
      "Medical records ID or prescription_id is missing from the URL."
    );
  }

  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    { _id: medicalRecords_id, "prescriptions._id": prescription_id },
    {
      $set: {
        "prescriptions.$.symptoms": symptoms,
        "prescriptions.$.diagnosedCondition": diagnosedCondition,
      },
    },
    { new: true, select: "-labTestReports -otherReports" }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedMedicalRecords },
        "Prescription updated successfully"
      )
    );
});

const changePrescribedMedicine = asyncHandler(async (req, res) => {
  const { name, dosage, frequency, instructions } = req.body;
  const { medicalRecords_id, prescription_id, medicine_id } = req.params;

  if (!medicalRecords_id || !prescription_id || !medicine_id) {
    throw new ApiError(
      400,
      "Medical records ID, prescription ID, or medicine ID is missing from the URL."
    );
  }

  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    {
      _id: medicalRecords_id,
      "prescriptions._id": prescription_id,
      "prescriptions.medicinesPrescribed._id": medicine_id,
    },
    {
      $set: {
        "prescriptions.$.medicinesPrescribed.$[medicine].name": name,
        "prescriptions.$.medicinesPrescribed.$[medicine].dosage": dosage,
        "prescriptions.$.medicinesPrescribed.$[medicine].frequency": frequency,
        "prescriptions.$.medicinesPrescribed.$[medicine].instructions":
          instructions,
      },
    },
    {
      new: true,
      arrayFilters: [{ "medicine._id": medicine_id }], // Use array filters to update specific medicine
      select: "-labTestReports -otherReports",
    }
  );

  if (!updatedMedicalRecords) {
    throw new ApiError(404, "Medical record not found or update failed.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedMedicalRecords },
        "Prescription updated successfully"
      )
    );
});

const deletePrescription = asyncHandler(async (req, res) => {
  const { medicalRecords_id, prescription_id } = req.params;

  if (!medicalRecords_id || !prescription_id) {
    throw new ApiError(
      400,
      "Medical records ID or prescription_id is missing from the URL."
    );
  }

  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    { _id: medicalRecords_id },
    {
      $pull: {
        prescriptions: { _id: prescription_id },
      },
    },
    { new: true, select: "-labTestReports -otherReports" }
  );

  if (!updatedMedicalRecords) {
    throw new ApiError(
      404,
      "Medical record not found or error while deletion."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Prescription deleted successfully"));
});

const deletePrescribedMedicine = asyncHandler(async (req, res) => {
  const { medicalRecords_id, prescription_id, medicine_id } = req.params;

  if (!medicalRecords_id || !prescription_id || !medicine_id) {
    throw new ApiError(
      400,
      "Medical records ID, prescription_id, or medicine_id is missing from the URL."
    );
  }

  const updatedMedicalRecords = await MedicalRecord.findOneAndUpdate(
    { _id: medicalRecords_id, "prescriptions._id": prescription_id },
    {
      $pull: {
        "prescriptions.$.medicinesPrescribed": { _id: medicine_id },
      },
    },
    { new: true, select: "-labTestReports -otherReports" }
  );

  if (!updatedMedicalRecords) {
    throw new ApiError(
      404,
      "Medical record not found or error while deletion."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Medicine deleted successfully"));
});

export {
  createPrescription,
  prescribeMedicines,
  changePrescription,
  changePrescribedMedicine,
  deletePrescribedMedicine,
  deletePrescription,
};
