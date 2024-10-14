import { Router } from "express";

import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  refreshAccessToken,
  changePassword,
  getDoctorProfile,
  changeDoctorAvatar,
  changeDoctorProfile,
  deleteDoctor,
} from "../controllers/Doctor/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router;

// authentication
router.route("/register").post(upload.single("avatar"), registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/logout").post(verifyJwt, logoutDoctor);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

// patient profile
router
  .route("/profile")
  .get(verifyJwt, getDoctorProfile)
  .delete(verifyJwt, deleteDoctor)
  .patch(verifyJwt, changeDoctorProfile);
router
  .route("/profile/update/avatar")
  .patch(verifyJwt, upload.single("avatar"), changeDoctorAvatar);
