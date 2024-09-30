import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  changeUserDetails
} from "../controllers/patient.controller.js";

import { upload } from "../middlewares/multter.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "displayPicture", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/change-password").post(verifyJwt, changePassword);
router.route("/change-user-details").post(verifyJwt, changeUserDetails);


export default router;
