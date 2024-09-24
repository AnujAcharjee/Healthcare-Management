import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // console.log("Request body:", req.body);
  // console.log("Uploaded files:", req.files);

  const { userName, email, phoneNumber, password, age, gender } = req.body;

  if (
    [userName, email, password, phoneNumber, age, gender].some(
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
    req.files?.displayPicture && req.files.displayPicture.length > 0
      ? req.files.displayPicture[0].path
      : null;

  const displayPicture = null;
  if (displayPictureLocalPath) {
    const displayPicture = await uploadCloudinary(displayPictureLocalPath);
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
    age,
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

export { registerUser };
