import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// get subscribers for a channel and toggle subscription for it
router
  .route("/c/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscribers);

// get channel list to which user has subscribed
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
