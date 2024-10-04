import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const patientSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    avatar: {
      url: {
        type: String
      },
      public_id: {
        type: String
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    DOB: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.isPasswordCorrect = async function (password) {
  if (!password) {
    throw new Error('Password not provided');
  }
  
  return await bcrypt.compare(password, this.password);
};

patientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      user: this.user,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

patientSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Patient = mongoose.model("Patient", patientSchema);
