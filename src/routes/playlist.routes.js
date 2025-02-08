import { Router } from "express";
import {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // add authentication middleware for all routes

// create playlist on home page of playlist
router.route("/").post(createPlaylist);

// get, update and delete single playlist
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

// add video to playlist
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
// add video to playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

// get all playlists of users
router.route("/user/:userId").get(getUserPlaylists);

export default router;
