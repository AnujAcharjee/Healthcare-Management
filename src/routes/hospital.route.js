import { Router } from "express";

import {
  registerHospital,
  loginHospital,
  logoutHospital,
  refreshAccessToken,
  changePassword,
} from "../controllers/hospital/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// authentication
router.route("/register").post(upload.single("coverImage"), registerHospital);
router.route("/login").post(loginHospital);
router.route("/logout").post(verifyJwt, logoutHospital);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

export default router;
