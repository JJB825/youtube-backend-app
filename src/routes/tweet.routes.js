import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// post a new tweet on tweets page
router.route("/").post(createTweet);

// get all tweets posted by user
router.route("/user/:userId").get(getUserTweets);

// update and delete a tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
