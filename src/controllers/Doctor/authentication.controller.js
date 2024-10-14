import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Doctor } from "../../models/doctor.model.js";
import { generateAccessTokenAndRefreshToken } from "../../utils/auth.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";

// cookies options
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
};

const registerDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    password,
    specialization,
    description,
    phone,
    email,
    hospitalEmail,
  } = req.body;

  if (
    [
      name,
      password,
      specialization,
      description,
      phone,
      email,
      hospitalEmail,
    ].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate email and phone format (basic example)
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }

  const isExistingDoctor = await Doctor.findOne({ email });
  if (isExistingDoctor) {
    throw new ApiError(409, "Email already exists");
  }

  const avatarLocalPath = req.file?.path;
  let avatar = null;

  if (avatarLocalPath) {
    try {
      avatar = await uploadCloudinary(avatarLocalPath);
      if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new ApiError(500, "Error uploading avatar");
    }
  } else {
    console.warn("No avatar provided");
  }

  // Find hospital by email
  const hospital = await Hospital.findOne({ email: hospitalEmail });
  if (!hospital) {
    throw new ApiError(404, "Invalid hospital email");
  }

  const doctor = await Doctor.create({
    phone,
    email,
    password,
    name,
    specialization,
    description,
    avatar: {
      url: avatar?.url || "",
      public_id: avatar?.public_id || "",
    },
    hospitalId: hospital._id,
  });

  const createdDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken"
  );

  if (!createdDoctor) {
    throw new ApiError(500, "Error while registering the doctor");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { doctor: createdDoctor },
        "Doctor registered successfully"
      )
    );
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Validate email format (basic example)
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    throw new ApiError(404, "doctor does not exist");
  }

  const isValidPassword = await doctor.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid login credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(Doctor, doctor._id);

  const loggedInDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          Doctor: loggedInDoctor,
          accessToken,
          refreshToken,
        },
        "Doctor logged in successfully"
      )
    );
});

const logoutDoctor = asyncHandler(async (req, res) => {
  await Doctor.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, 
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Doctor logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(Doctor, req.user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Confirmed password is not the same as new password"
    );
  }

  const doctor = await Doctor.findById(req.user?._id);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const isValidPassword = await doctor.isPasswordCorrect(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid old password");
  }

  doctor.password = newPassword;
  await doctor.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successful"));
});

export {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  refreshAccessToken,
  changePassword,
};
