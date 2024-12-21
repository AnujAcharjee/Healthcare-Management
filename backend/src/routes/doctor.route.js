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
  createPrescription,
  prescribeMedicines,
  changePrescription,
  changePrescribedMedicine,
  deletePrescribedMedicine,
  deletePrescription,
} from "../controllers/Doctor/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// authentication
router.route("/register").post(upload.single("avatar"), registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/logout").post(verifyJwt, logoutDoctor);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

// profile
router
  .route("/profile")
  .get(verifyJwt, getDoctorProfile)
  .patch(verifyJwt, changeDoctorProfile)
  .delete(verifyJwt, deleteDoctor);
router
  .route("/profile/update/avatar")
  .patch(verifyJwt, upload.single("avatar"), changeDoctorAvatar);

// prescription
router.route("/prescription").post(verifyJwt, createPrescription);
router
  .route("/medical-records/:medicalRecords_id/prescription/:prescription_id")
  .patch(verifyJwt, changePrescription)
  .delete(verifyJwt, deletePrescription);

router
  .route(
    "/medical-records/:medicalRecords_id/prescription/:prescription_id/medicine"
  )
  .post(verifyJwt, prescribeMedicines);
router
  .route(
    "/medical-records/:medicalRecords_id/prescription/:prescription_id/medicine/:medicine_id"
  )
  .patch(verifyJwt, changePrescribedMedicine)
  .delete(verifyJwt, deletePrescribedMedicine);

export default router;
