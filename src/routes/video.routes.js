import { Router } from "express";
// import controller functions
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";
// import middlewares
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// setup routes
// get all videos, and publish a video on home path of videos
router.route("/").get(getAllVideos).post(publishVideo);

// get, update, delete a single video
router
  .route("/:videoId")
  .get(getVideoById)
  .patch(updateVideo)
  .delete(deleteVideo);
// toggle publish status of video

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
