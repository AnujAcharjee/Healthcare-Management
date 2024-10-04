import { MedicalRecord } from "../../models/medicalRecords.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { uploadCloudinary, deleteCloudinary } from "../../utils/cloudinary.js";

const uploadLabTestReports = asyncHandler(async (req, res) => {
  const { labName, testType, description } = req.body;

  if (!labName || !testType || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(400, "No file uploaded");
  }

  const fileCloudUpload = await uploadCloudinary(fileLocalPath);

  if (!fileCloudUpload) {
    throw new ApiError(400, "Error while uploading on Cloudinary");
  }

  const updatedMedicalRecord = await MedicalRecord.findOneAndUpdate(
    { patientId: req.user?._id },
    {
      labTestReports: {
        labName,
        testType,
        description,
        uploadedFile: {
          url: fileCloudUpload.url,
          public_id: fileCloudUpload.public_id,
        },
      },
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMedicalRecord,
        "Report successfully uploaded to Cloudinary"
      )
    );
});

const uploadOtherReports = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const fileLocalPath = req.file?.path;

  if (!fileLocalPath) {
    throw new ApiError(400, "No file uploaded");
  }

  const fileCloudUpload = await uploadCloudinary(fileLocalPath);

  if (!fileCloudUpload) {
    throw new ApiError(400, "Error while uploading on Cloudinary");
  }

  const updatedMedicalRecord = await MedicalRecord.findOneAndUpdate(
    { patientId: req.user?._id },
    {
      otherReports: {
        title,
        description,
        uploadedFile: {
          url: fileCloudUpload.url,
          public_id: fileCloudUpload.public_id,
        },
      },
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMedicalRecord,
        "Report successfully uploaded to Cloudinary"
      )
    );
});

export { uploadOtherReports, uploadLabTestReports };
