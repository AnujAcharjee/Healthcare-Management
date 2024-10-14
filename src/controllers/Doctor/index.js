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
};
