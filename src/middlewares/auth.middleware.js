import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Patient } from "../models/patient.model.js";
import { Hospital } from "../models/hospital.model.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  const accessToken =
    req.cookies?.accessToken || // acquire access token from cookie
    req.header("Authorization")?.replace(/bearer\s+/i, ""); //acquire access token from Header

  // console.log(token);

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  // with Access Token present
  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    let user;
    if (decodedAccessToken.userType === "Patient") {
      user = await Patient.findById(decodedAccessToken?._id).select(
        "-password -refreshToken"
      );
    } else if (decodedAccessToken.userType === "Hospital") {
      user = await Hospital.findById(decodedAccessToken?._id).select(
        "-password -refreshToken"
      );
    }

    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }

    req.user = user; // setting user obj in req body
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token expired, checking refresh token...");
    } else {
      throw new ApiError(401, "Invalid Access Token");
    }
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

    let user;
    if (decodedAccessToken.userType === "Patient") {
      user = await Patient.findById(decodedAccessToken?._id).select(
        "-password -refreshToken"
      );
    } else if (decodedAccessToken.userType === "Hospital") {
      user = await Hospital.findById(decodedAccessToken?._id).select(
        "-password -refreshToken"
      );
    }

    if (!user) {
      throw new ApiError(403, "Invalid refresh token");
    }

    req.user = user; // setting user obj in req body

    return next();
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});
