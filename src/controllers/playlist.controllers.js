import { asyncHandler } from "../utils/asyncHandler";

const createPlaylist = asyncHandler(async (req, res) => {});
const getUserPlaylists = asyncHandler(async (req, res) => {});
const getPlaylistById = asyncHandler(async (req, res) => {});
const addVideoToPlaylist = asyncHandler(async (req, res) => {});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {});
const updatePlaylist = asyncHandler(async (req, res) => {});
const deletePlaylist = asyncHandler(async (req, res) => {});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
};
