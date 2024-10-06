import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Patient } from "../../models/patient.model.js";
import { MedicalRecord } from "../../models/medicalRecords.model.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";
import { generateAccessTokenAndRefreshToken } from "../../utils/auth.js";

// cookies options
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
};

const registerPatient = asyncHandler(async (req, res) => {
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

  // creating Patient Doc. for user
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

  // creating medicalRecords Doc. for user at the time of registration
  const medicalRecords = await MedicalRecord.create({
    patientId: user._id,
    prescriptions: [],
    labTestReports: [],
    otherReports: [],
  });

  if (!medicalRecords) {
    await Patient.findByIdAndDelete(user._id); // delete patient Doc.
    throw new ApiError(500, "Failed to create medical records");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, medicalRecords },
        "User registered Successfully"
      )
    );
});

const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await Patient.findOne({ email });

  if (!user || user.userType !== "Patient") {
    throw new ApiError(404, "User does not exist");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(Patient, user._id);

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

const logoutPatient = asyncHandler(async (req, res) => {
  console.log(req.user);

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
    await generateAccessTokenAndRefreshToken(Patient, req.user._id);

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

export {
  registerPatient,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  changePassword,
};
