import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Hospital } from "../../models/hospital.model.js";
import {
  uploadCloudinary,
  deleteCloudinary,
  deleteArrayElements,
} from "../../utils/cloudinary.js";

const hospitalProfile = asyncHandler(async (req, res) => {
  const user = await Hospital.aggregate([
    { $match: { _id: req.user?._id } },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "hospital_id",
        as: "departments",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        location: 1,
        ownership: 1,
        coverImage: 1,
        departments:  "$departments.name" ,
      },
    },
  ]);

  if (!user) {
    throw new ApiError(404, "Hospital not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "Hospital profile retrieved successfully."));
});

const changeHospitalProfile = asyncHandler(async (req, res) => {
  const { name, state, city, zip, phone, email, ownership, password } =
    req.body;

  if (
    [name, state, city, zip, phone, email, ownership, password].some(
      (field) => field === undefined || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await Hospital.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid password");
  }

  const updatedUser = await Hospital.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        name,
        phone,
        email,
        location: {
          state,
          city,
          zip,
        },
        ownership,
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

const changeCoverImage = asyncHandler(async (req, res) => {
  const newCoverImageLocalPath = req.file?.path;

  if (!newCoverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  // Delete prev image
  if (req.user?.coverImage?.public_id) {
    const deletePrevCoverImage = await deleteCloudinary(
      req.user.coverImage.public_id
    );

    if (!deletePrevCoverImage) {
      throw new ApiError(400, "Error while deleting previous Cover Image");
    }
  }

  // Upload new image
  const newCoverImage = await uploadCloudinary(newCoverImageLocalPath);

  if (!newCoverImage) {
    throw new ApiError(400, "Error while uploading on Cloudinary");
  }

  const updatedUser = await Hospital.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: {
          url: newCoverImage?.url,
          public_id: newCoverImage?.public_id,
        },
      },
    },
    { new: true, select: "-password -refreshToken" }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

const deleteHospital = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await Hospital.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid password");
  }

  // delete avatar from cloudinary
  if (user.coverImage?.public_id) {
    const deletedCoverImage = await deleteCloudinary(
      user.coverImage?.public_id
    );

    if (!deletedCoverImage) {
      throw new ApiError(500, "Error deleting CoverImage from Cloudinary");
    }
  }

  // delete departments

  //delete wards

  // delete inventory

  // delete opd

  await Hospital.findByIdAndDelete(user._id); // delete profile from DB

  return res
    .status(200)
    .json(new ApiResponse(200, user.name, "Hospital deletion successful"));
});

export {
  hospitalProfile,
  changeHospitalProfile,
  changeCoverImage,
  deleteHospital,
};
