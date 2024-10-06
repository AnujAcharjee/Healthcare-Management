import {
  registerPatient,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  changePassword,
} from "./authentication.controller.js";

import {
  patientProfile,
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
  patientProfile,
  changePatientProfile,
  changePatientAvatar,
  deletePatient,
  uploadOtherReports,
  uploadLabTestReports,
};
