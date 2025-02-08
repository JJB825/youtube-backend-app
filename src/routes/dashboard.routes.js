import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
