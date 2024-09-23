import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { uploadCloudinary } from "../utils/coludinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, phoneNumber, password } = req.body;

  if (
    [userName, email, password, phoneNumber].some(
      (element) => element?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await Patient.findOne({
    $or: [{ email }, { phoneNumber }],
  });
  if (existingUser) {
    throw new ApiError(409, "email or Phone number already exists");
  }

  const displayPictureLocalPath =
    req.file?.displayPicture[0].displayPictureLocalPath;
  if (!displayPictureLocalPath) {
    throw new ApiError(400, "displayPicture file is required");
  }

  const displayPicture = await uploadCloudinary(displayPictureLocalPath);
  if (!displayPicture) {
    throw new ApiError(400, "displayPicture file is required");
  }

  const user = await Patient.create({
    userName,
    email,
    phoneNumber,
    password,
    displayPicture: displayPicture.url,
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
