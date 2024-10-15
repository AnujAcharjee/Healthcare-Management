import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Doctor } from "../../models/doctor.model.js";
import { Hospital } from "../../models/hospital.model.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";

import { deleteCloudinary } from "../../utils/cloudinary.js";

const getDoctorProfile = asyncHandler(async (req, res) => {
  const user = await Doctor.aggregate([
    { $match: { _id: req.user?._id } },
    {
      $addFields: {
        hospitalId: { $toObjectId: "$hospitalId" }, // Cast hospitalId to ObjectId
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "hospitalId",
        foreignField: "_id",
        as: "hospitalInfo",
      },
    },
    {
      $project: {
        name: 1,
        specialization: 1,
        description: 1,
        avatar: 1,
        phone: 1,
        email: 1,
        hospitalName: { $arrayElemAt: ["$hospitalInfo.name", 0] },
      },
    },
  ]);

  if (!user || user.length === 0) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], "Doctor profile retrieved successfully")
    );
});

const changeDoctorProfile = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { name, specialization, description, phone, email, hospitalEmail } =
    req.body;

  console.log("Email received:", email);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  console.log("hello 2");

  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  console.log("all goosd");

  const user = await Doctor.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if email is already in use, but allow the current user to keep their email
  const isExistingEmail = await Doctor.findOne({
    email,
    _id: { $ne: user._id },
  });
  if (isExistingEmail) {
    throw new ApiError(409, "Email already exists");
  }

  let hospital = null;
  if (hospitalEmail) {
    hospital = await Hospital.findOne({ email: hospitalEmail });
    if (!hospital) {
      throw new ApiError(404, "Invalid hospital email");
    }
  }

  const updates = {};
  if (name) updates.name = name;
  if (specialization) updates.specialization = specialization;
  if (description) updates.description = description;
  if (phone) updates.phone = phone;
  if (email) updates.email = email;
  if (hospital) updates.hospital_id = hospital._id;

  const updatedUser = await Doctor.findByIdAndUpdate(
    user?._id,
    { $set: updates },
    { new: true, select: "-password -refreshToken -avatar" }
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

const changeDoctorAvatar = asyncHandler(async (req, res) => {
  const newAvatarLocalPath = req.file?.path;
  console.log(newAvatarLocalPath);

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

  const updatedUser = await Doctor.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: newAvatar?.url,
          public_id: newAvatar?.public_id,
        },
      },
    },
    {
      new: true,
      select:
        "-password -refreshToken  -name -specialization -description -phone -email -hospitalId",
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Avatar image updated successfully")
    );
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await Doctor.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid password");
  }

  // Delete avatar from cloudinary
  if (user.avatar?.public_id) {
    const deletedAvatar = await deleteCloudinary(user.avatar?.public_id);

    if (!deletedAvatar) {
      throw new ApiError(500, "Error deleting avatar from Cloudinary");
    }
  }

  await Doctor.findByIdAndDelete(user._id);

  return res
    .status(204)
    .json(new ApiResponse(204, user.userName, "User deletion successful"));
});

export {
  getDoctorProfile,
  changeDoctorAvatar,
  changeDoctorProfile,
  deleteDoctor,
};
