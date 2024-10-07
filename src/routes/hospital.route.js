import { Router } from "express";

import {
  registerHospital,
  loginHospital,
  logoutHospital,
  refreshAccessToken,
  changePassword,
  hospitalProfile,
  changeCoverImage,
  changeHospitalProfile,
  deleteHospital,
} from "../controllers/Hospital/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// authentication
router.route("/register").post(upload.single("coverImage"), registerHospital);
router.route("/login").post(loginHospital);
router.route("/logout").post(verifyJwt, logoutHospital);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

//Profile
router.route("/profile").get(verifyJwt, hospitalProfile);
router.route("/profile/update").patch(verifyJwt, changeHospitalProfile);
router
  .route("/profile/update/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), changeCoverImage);
router.route("/profile/delete").delete(verifyJwt, deleteHospital);

export default router;
