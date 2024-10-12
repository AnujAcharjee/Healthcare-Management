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

const getPatientProfile = asyncHandler(async (req, res) => {
  const user = await Patient.aggregate([
    { $match: { _id: req.user?._id } },
    {
      $lookup: {
        from: "allocated_beds",
        localField: "email",
        foreignField: "patientEmail",
        as: "bedAllocated",
      },
    },
    {
      $addFields: {
        bedAllocated: { $arrayElemAt: ["$bedAllocated", 0] },
      },
    },
    {
      $lookup: {
        from: "wards",
        localField: "bedAllocated.ward_id",
        foreignField: "_id",
        as: "ward",
      },
    },
    {
      $addFields: {
        ward: { $arrayElemAt: ["$ward", 0] },
      },
    },
    {
      $lookup: {
        from: "departments",
        localField: "ward.department_id",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $addFields: {
        department: { $arrayElemAt: ["$department", 0] },
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "department.hospital_id",
        foreignField: "_id",
        as: "hospital",
      },
    },
    {
      $addFields: {
        hospital: { $arrayElemAt: ["$hospital", 0] },
      },
    },
    {
      $project: {
        userName: 1,
        email: 1,
        phoneNumber: 1,
        avatar: 1,
        DOB: 1,
        gender: 1,
        bedAllocated: "$bedAllocated.bedNumber",
        ward: "$ward.name",
        department: "$department.name",
        hospital: "$hospital.name",
        opdAppointments: 1,
      },
    },
  ]);

  if (!user || user.length === 0) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user[0]));
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
    { new: true, select: "-password -refreshToken -avatar -opdAppointments" }
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
    { new: true, select: "-password -refreshToken -email -phoneNumber -gender -DOB -opdAppointments" }
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

  // Delete avatar from cloudinary
  if (user.avatar?.public_id) {
    const deletedAvatar = await deleteCloudinary(user.avatar?.public_id);

    if (!deletedAvatar) {
      throw new ApiError(500, "Error deleting avatar from Cloudinary");
    }
  }

  // Find and delete medical records
  const medicalRecords = await MedicalRecord.findOneAndDelete({
    patientId: user._id,
  });

  // Delete medical record files from cloudinary
  if (medicalRecords) {
    await deleteArrayElements(medicalRecords.labTestReports);
    await deleteArrayElements(medicalRecords.otherReports);
  }

  // Delete patient profile
  await Patient.findByIdAndDelete(user._id);

  return res
    .status(204)
    .json(new ApiResponse(204, user.userName, "User deletion successful"));
});

export {
  getPatientProfile,
  changePatientProfile,
  changePatientAvatar,
  deletePatient,
};
