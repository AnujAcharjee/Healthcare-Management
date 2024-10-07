import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Patient } from "../../models/patient.model.js";
import { MedicalRecord } from "../../models/medicalRecords.model.js";
import {
  uploadCloudinary,
  deleteCloudinary,
  deleteArrayElements,
} from "../../utils/cloudinary.js";

const patientProfile = asyncHandler(async (req, res) => {
  const user = await Patient.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user));
});

const changePatientProfile = asyncHandler(async (req, res) => {
  const { userName, email, phoneNumber, DOB, gender, password } = req.body;

  if (
    [userName, email, phoneNumber, DOB, gender, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await Patient.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid password");
  }

  const updatedUser = await Patient.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        userName,
        email,
        phoneNumber,
        DOB,
        gender,
      },
    },
    { new: true, select: "-password -refreshToken" }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found or Error while updating values");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const changePatientAvatar = asyncHandler(async (req, res) => {
  const newAvatarLocalPath = req.file?.path;

  if (!newAvatarLocalPath) {
    throw new ApiError(400, "Display Picture file is missing");
  }

  // Delete prev image
  if (req.user?.avatar?.public_id) {
    const deletePrevAvatar = await deleteCloudinary(req.user.avatar.public_id);

    if (!deletePrevAvatar) {
      throw new ApiError(400, "Error while deleting previous avatar");
    }
  }

  // Upload new image
  const newAvatar = await uploadCloudinary(newAvatarLocalPath);

  if (!newAvatar) {
    throw new ApiError(400, "Error while uploading on Cloudinary");
  }

  const updatedUser = await Patient.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: newAvatar?.url,
          public_id: newAvatar?.public_id,
        },
      },
    },
    { new: true, select: "-password -refreshToken" }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});

const deletePatient = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await Patient.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid password");
  }

  // delete avatar from cloudinary
  if (user.avatar?.public_id) {
    const deletedAvatar = await deleteCloudinary(user.avatar?.public_id);

    if (!deletedAvatar) {
      throw new ApiError(500, "Error deleting avatar from Cloudinary");
    }
    // console.log("avatar deleted");
  }

  // Find the user's medical records
  const medicalRecords = await MedicalRecord.findOne({
    patientId: user._id,
  });
  // console.log("found medical records");

  // Delete medical record files from cloudinary
  if (medicalRecords) {
    await deleteArrayElements(medicalRecords.labTestReports);
    console.log("deleted labtest reports");
    await deleteArrayElements(medicalRecords.otherReports);
    console.log("deleted other reports");
  }
  // console.log("came after medical reports cloud delete");
  

  await Patient.findByIdAndDelete(user._id); // Delete profile from DB
  // console.log("Patient deleted");
  
  await MedicalRecord.findByIdAndDelete(medicalRecords._id); //Delete medical records from DB
  // console.log("medical records deleted");
  

  return res
    .status(200)
    .json(new ApiResponse(200, user.userName, "User deletion successful"));
});

export { patientProfile, changePatientProfile, changePatientAvatar, deletePatient };
