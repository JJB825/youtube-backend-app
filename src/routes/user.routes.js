import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  // middleware for file handling
  upload.fields([
    // the name property shall match the form object property from frontend
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
); // whenever router receives control, it will check for /register route and execute the registerUser function for post method

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account-details").post(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .post(
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    verifyJWT,
    updateUserAvatar
  );
router
  .route("/update-coverImage")
  .post(
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    verifyJWT,
    updateUserCoverImage
  );

export default router;
