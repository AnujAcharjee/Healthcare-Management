import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { uploadCloudinary, deleteCloudinary } from "../utils/cloudinary.js";

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

  const isExistingUser = await Patient.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (isExistingUser) {
    throw new ApiError(409, "Email or Phone number already exists");
  }

  const avatarLocalPath = req.file?.path;
  // console.log(avatarLocalPath);

  let avatar = null;
  if (avatarLocalPath) {
    avatar = await uploadCloudinary(avatarLocalPath);
    // console.log("Cloudinary upload result:", avatar);

    if (!avatar) {
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
    avatar: {
      url: avatar?.url || "",
      public_id: avatar?.public_id || "",
    },
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
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Confirmed password is not the same as new password"
    );
  }

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

const changeUserAvatar = asyncHandler(async (req, res) => {
  const newAvatarLocalPath = req.file?.path;

  if (!newAvatarLocalPath) {
    throw new ApiError(400, "Display Picture file is missing");
  }

  // Delete prev image
  const deletedPreviousDp = await deleteCloudinary(req.user?.avatar.public_id);

  if (!deletedPreviousDp) {
    throw new ApiError(400, "Error while deleting previous avatar");
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
    .json(new ApiResponse(200, updatedUser, "Avatar image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  changeUserDetails,
  changeUserAvatar,
};
