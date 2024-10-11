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
  createDepartment,
  createWard,
  getAllWards,
  updateWard,
  allocateBed,
  getAllocatedBedsInfo,
  deleteAllocatedBed,
} from "../controllers/Hospital/index.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication
router.route("/register").post(upload.single("coverImage"), registerHospital);
router.route("/login").post(loginHospital);
router.route("/logout").post(verifyJwt, logoutHospital);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/reset-password").post(verifyJwt, changePassword);

// Profile
router
  .route("/profile")
  .get(verifyJwt, hospitalProfile)
  .delete(verifyJwt, deleteHospital)
  .patch(verifyJwt, changeHospitalProfile);
router
  .route("/profile/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), changeCoverImage);

// Department
router.route("/department/create").post(verifyJwt, createDepartment);
router.route("/department/:department_id/wards").get(verifyJwt, getAllWards);
router
  .route("/department/:department_id/ward/create")
  .post(verifyJwt, createWard);
router
  .route("/department/ward/:ward_id")
  .patch(verifyJwt, updateWard)
  .post(verifyJwt, allocateBed)
  .get(verifyJwt, getAllocatedBedsInfo);
router
  .route("/department/ward/bed/:bed_id")
  .delete(verifyJwt, deleteAllocatedBed);

export default router;
