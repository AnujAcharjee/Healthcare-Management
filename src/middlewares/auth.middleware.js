import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Patient } from "../models/patient.model.js";
import { Hospital } from "../models/hospital.model.js";
import { Doctor } from "../models/doctor.model.js";

// Helper function 
const getUserType = async (token) => {
  if (token.userType === "Patient") {
    return await Patient.findById(token._id).select("-password -refreshToken");
  }
  if (token.userType === "Hospital") {
    return await Hospital.findById(token._id).select("-password -refreshToken");
  }
  if (token.userType === "Doctor") {
    return await Doctor.findById(token._id).select("-password -refreshToken");
  }
  return null; // No valid user type
};

export const verifyJwt = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken || // acquire access token from cookie
    req.header("Authorization")?.replace(/bearer\s+/i, ""); //acquire access token from Header

  // console.log(token);

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  // with Access Token present
  let decodedAccessToken;
  try {
    decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired, checking refresh token...");
    } else {
      throw new ApiError(401, "Invalid Access Token");
    }
  }
  
   // Handle valid access token
   if (decodedAccessToken) {
    req.user = await getUserType(decodedAccessToken);
    if (!req.user) {
      throw new ApiError(401, "Unauthorized user");
    }
    return next();
  }

  // If access token expired, handle refresh token
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token found");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Refresh user
    const user = await getUserType(decodedRefreshToken);
    if (!user) {
      throw new ApiError(403, "Invalid refresh token");
    }

    req.user = user; // setting user obj in req body

    return next();
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});
