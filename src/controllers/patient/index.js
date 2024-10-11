import {
  registerPatient,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  changePassword,
} from "./authentication.controller.js";

import {
  getPatientProfile,
  changePatientProfile,
  changePatientAvatar,
  deletePatient,
} from "./profile.controller.js";

import { 
    uploadOtherReports,
    uploadLabTestReports, 

} from "./medicalRecords.controller.js";

export {
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
};
