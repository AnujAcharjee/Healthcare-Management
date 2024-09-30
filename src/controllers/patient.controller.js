import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

// cookies options
const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await Patient.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // console.log("Request body:", req.body);
  // console.log("Uploaded files:", req.files);

  const { userName, email, phoneNumber, password, DOB, gender } = req.body;

  if (
    [userName, email, password, phoneNumber, DOB, gender].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await Patient.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Phone number already exists");
  }

  const displayPictureLocalPath =
    req.files?.displayPicture && req.files?.displayPicture.length > 0
      ? req.files.displayPicture[0].path
      : null;

  let displayPicture = null;
  if (displayPictureLocalPath) {
    displayPicture = await uploadCloudinary(displayPictureLocalPath);
    // console.log("Cloudinary upload result:", displayPicture);

    if (!displayPicture) {
      throw new ApiError(500, "Failed to upload display picture in Cloudinary");
    }
  } else {
    console.warn("No display picture provided");
  }

  const user = await Patient.create({
    userName,
    email,
    phoneNumber,
    password,
    DOB,
    gender,
    displayPicture: displayPicture?.url || "",
  });

  const createdUser = await Patient.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await Patient.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await Patient.findById(user._id).select(
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
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await Patient.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, // this removes the field from document
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(req.user._id);

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
  const { oldPassword, newPassword } = req.body;

  const user = await Patient.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.isPasswordCorrect(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successful"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
  const { userName, email, phoneNumber, DOB, gender, password } = req.body;

  if (
    [userName, email, phoneNumber, DOB, gender, password].some(
      (field) => !field || field?.trim() === ""
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
    req.user?._id,
    {
      $set: {
        userName,
        email,
        phoneNumber,
        DOB,
        gender,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  changeUserDetails,
};
