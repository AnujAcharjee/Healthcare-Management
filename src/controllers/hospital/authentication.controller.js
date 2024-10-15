import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Hospital } from "../../models/hospital.model.js";
import { generateAccessTokenAndRefreshToken } from "../../utils/auth.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";

// cookies options
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
};

const registerHospital = asyncHandler(async (req, res) => {
  const { name, password, state, city, zip, address, phone, email, ownership } =
    req.body;

  if (
    [name, password, state, city, zip, address, phone, email, ownership].some(
      (field) => !field || field?.trim() === ""
    )
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

  const isExistingHospital = await Hospital.findOne({
    $or: [{ email }, { phone }],
  });
  if (isExistingHospital) {
    throw new ApiError(409, "Email or Phone number already exists");
  }

  const coverImageLocalPath = req.file?.path;

  let coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadCloudinary(coverImageLocalPath);

    if (!coverImage) {
      throw new ApiError(500, "Failed to upload display picture in Cloudinary");
    }
  } else {
    console.warn("No display picture provided");
  }

  // creating Hospital Doc. for Hospital
  const hospital = await Hospital.create({
    name,
    password,
    phone,
    email,
    location: {
      state,
      city,
      zip,
    },
    ownership,
    coverImage: {
      url: coverImage?.url || "",
      public_id: coverImage?.public_id || "",
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

const loginHospital = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Validate email format (basic example)
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const hospital = await Hospital.findOne({ email });

  if (!hospital) {
    throw new ApiError(404, "Hospital does not exist");
  }

  const isValidPassword = await hospital.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid Hospital credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(Hospital, hospital._id);

  const loggedInHospital = await Hospital.findById(hospital._id).select(
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
          Hospital: loggedInHospital,
          accessToken,
          refreshToken,
        },
        "Hospital logged in successfully"
      )
    );
});

const logoutHospital = asyncHandler(async (req, res) => {
  await Hospital.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, // this removes the field from document
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Hospital logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(Hospital, req.user._id);

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

  const hospital = await Hospital.findById(req.user?._id);

  if (!hospital) {
    throw new ApiError(404, "hospital not found");
  }

  const isValidPassword = await hospital.isPasswordCorrect(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  hospital.password = newPassword;
  await hospital.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successful"));
});

export {
  registerHospital,
  loginHospital,
  logoutHospital,
  refreshAccessToken,
  changePassword,
};
