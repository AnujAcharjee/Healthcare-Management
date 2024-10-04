import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
} from "../patient/authentication.controller.js";

import {
  userProfile,
  changeUserProfile,
  changeUserAvatar,
  deleteUser,
} from "../patient/profile.controller.js";

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  userProfile,
  changeUserProfile,
  changeUserAvatar,
  deleteUser,
};
