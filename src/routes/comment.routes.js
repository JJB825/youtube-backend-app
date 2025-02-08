import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// add and get all comments for a video
router.route("/:videoId").get(getVideoComments).post(addComment);

// update and delete comment
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
