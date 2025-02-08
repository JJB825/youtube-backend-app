import { asyncHandler } from "../utils/asyncHandler";

const toggleSubscription = asyncHandler(async (req, res) => {});

// controller to return subscriber list of channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

// controller to return subscribed channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
