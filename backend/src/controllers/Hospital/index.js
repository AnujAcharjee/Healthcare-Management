import {
  registerHospital,
  loginHospital,
  logoutHospital,
  refreshAccessToken,
  changePassword,
} from "./authentication.controller.js";

import {
  getHospitalProfile,
  changeHospitalProfile,
  changeCoverImage,
  deleteHospital,
} from "./profile.controller.js";

import {
  createDepartment,
  createWard,
  getAllWards,
  updateWard,
  allocateBed,
  getAllocatedBedsInfo,
  deleteAllocatedBed
} from "./department.controller.js";

export {
  registerHospital,
  loginHospital,
  logoutHospital,
  refreshAccessToken,
  changePassword,
  getHospitalProfile,
  changeCoverImage,
  changeHospitalProfile,
  deleteHospital,
  createDepartment,
  createWard,
  getAllWards,
  updateWard,
  allocateBed,
  getAllocatedBedsInfo,
  deleteAllocatedBed
};
