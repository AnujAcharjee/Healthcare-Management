import { MedicalRecord } from "../../models/medicalRecords.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { uploadCloudinary, deleteCloudinary } from "../../utils/cloudinary.js";

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

  const otherReport = await MedicalRecord.create({
    otherReports: {
      title,
      description,
      uploadedFiles: {
        url: fileCloudUpload.url,
        public_id: fileCloudUpload.public_id,
      },
    },
  });
});
