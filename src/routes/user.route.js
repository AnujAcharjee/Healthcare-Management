import { Router } from "express";
import { registerUser } from "../controllers/patient.controller.js";
import { upload } from "../middlewares/multter.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([{ name: "displayPicture", maxCount: 1 }]),

  registerUser
);

export default router;
