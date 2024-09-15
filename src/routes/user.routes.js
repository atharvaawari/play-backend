import { Router } from "express";
import {upload} from '../middleware/multer.middleware.js';
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  refreshAccessToken, 
  changeCurrentUserPassword, 
  getCurrentUser, 
  updatedUserDetails, 
  updateduserAvatar, 
  updateUserCoverImage, 
  getUserChannelProfile, 
  getWatchHistory 
} 
from "../controllers/user.controller.js";

const router =  Router();

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
      name:"coverImage",
      maxCount:1
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(changeCurrentUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updatedUserDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateduserAvatar);
router.route("/conver-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router