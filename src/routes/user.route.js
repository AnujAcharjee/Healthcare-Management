import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  userProfile,
  changeUserProfile,
  changeUserAvatar,
  deleteUser,
} from "../controllers/patient/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// authentication
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

// user profile
router.route("/profile").get(verifyJwt, userProfile);
router.route("/profile/update").patch(verifyJwt, changeUserProfile);
router
  .route("/profile/update/avatar")
  .patch(verifyJwt, upload.single("avatar"), changeUserAvatar);
router.route("/profile/delete").delete(verifyJwt, deleteUser);

export default router;
