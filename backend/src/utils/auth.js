import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Password hashing middleware
const hashPassword = async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
};

// Method to check if password is correct
const isPasswordCorrect = async function (password) {
  if (!password) {
    throw new Error("Password not provided");
  }
  return await bcrypt.compare(password, this.password);
};

// Method to generate access token
const generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, user: this.user, userType: this.userType },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Method to generate refresh token
const generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, userType: this.userType },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// fn to generate tokens
const generateAccessTokenAndRefreshToken = async (schema, userId) => {
  try {
    const user = await schema.findById(userId);

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

export {
  hashPassword,
  isPasswordCorrect,
  generateAccessToken,
  generateRefreshToken,
  generateAccessTokenAndRefreshToken,
};
