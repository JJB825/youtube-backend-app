import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// like/dislike video
router.route("/toggle/v/:videoId").post(toggleVideoLike);
// like/dislike comment
router.route("/toggle/c/:commentId").post(toggleCommentLike);
// like/dislike tweet
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
// get liked videos
router.route("/toggle/videos").get(getLikedVideos);

export default router;
