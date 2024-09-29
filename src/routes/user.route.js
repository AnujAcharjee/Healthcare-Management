import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/patient.controller.js";
import { upload } from "../middlewares/multter.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "displayPicture", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

export default router;
