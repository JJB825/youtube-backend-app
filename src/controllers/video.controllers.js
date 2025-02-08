import { asyncHandler } from "../utils/asyncHandler";

const getAllVideos = asyncHandler(async (req, res) => {});

const getVideoById = asyncHandler(async (req, res) => {});

const publishVideo = asyncHandler(async (req, res) => {});

const updateVideo = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});

const togglePublishStatus = asyncHandler(async (req, res) => {});

export {
  getAllVideos,
  getVideoById,
  publishVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
