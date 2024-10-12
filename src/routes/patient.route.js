import { Router } from "express";
import {
  registerPatient,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  changePassword,
  getPatientProfile,
  changePatientProfile,
  changePatientAvatar,
  deletePatient,
  uploadOtherReports,
  uploadLabTestReports,
  getAllMedicalReports,
} from "../controllers/Patient/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// authentication
router.route("/register").post(upload.single("avatar"), registerPatient);
router.route("/login").post(loginPatient);
router.route("/logout").post(verifyJwt, logoutPatient);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

// patient profile
router
  .route("/profile")
  .get(verifyJwt, getPatientProfile)
  .delete(verifyJwt, deletePatient)
  .patch(verifyJwt, changePatientProfile);
router
  .route("/profile/update/avatar")
  .patch(verifyJwt, upload.single("avatar"), changePatientAvatar);

// patient medical records
router.route("/medical-records").get(verifyJwt, getAllMedicalReports);
router
  .route("/medical-records/other-reports")
  .post(verifyJwt, upload.single("medicalReport"), uploadOtherReports);
router
  .route("/medical-records/lab-test-reports")
  .post(verifyJwt, upload.single("labTestReport"), uploadLabTestReports);

export default router;
