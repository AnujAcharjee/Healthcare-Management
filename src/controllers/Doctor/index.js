import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  refreshAccessToken,
  changePassword,
} from "./authentication.controller.js";

import {
  getDoctorProfile,
  changeDoctorAvatar,
  changeDoctorProfile,
  deleteDoctor,
} from "./profile.controller.js";

import {
  createPrescription,
  prescribeMedicines,
  changePrescription,
  changePrescribedMedicine,
  deletePrescribedMedicine,
  deletePrescription,
} from "./prescription.controller.js";

export {
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
};
