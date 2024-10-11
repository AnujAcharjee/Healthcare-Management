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
  const { name, password, specialization, description, phone, email } =
    req.body;

  if (
    [name, password, specialization, description, phone, email].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const isExistingDoctor = await Doctor.findOne({
    $or: [{ email }, { phone }],
  });

  if (isExistingDoctor) {
    throw new ApiError(409, "Email or Phone number already exists");
  }

  const avatarLocalPath = req.file?.path;

  let avatar = null;
  if (avatarLocalPath) {
    avatar = await uploadCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(500, "Failed to upload display picture in Cloudinary");
    }
  } else {
    console.warn("No display picture provided");
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
  });

  const createdHospital = await Hospital.findById(hospital._id).select(
    "-password -refreshToken"
  );

  if (!createdHospital) {
    throw new ApiError(
      500,
      "Something went wrong while registering the Hospital"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { Hospital: createdHospital },
        "Hospital registered Successfully"
      )
    );
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const doctor = await Doctor.findOne({ email });

  if (!Doctor) {
    throw new ApiError(404, "doctor does not exist");
  }

  const isValidPassword = await doctor.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid Doctor credentials");
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
      refreshToken: 1, // this removes the field from document
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
    throw new ApiError(404, "doctor not found");
  }

  const isValidPassword = await doctor.isPasswordCorrect(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
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
