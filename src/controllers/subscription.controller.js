import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { subscribe } from "diagnostics_channel";


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  //TODO: toggle subscription

  const channel = await User.findById(channelId);

  if (!channel) throw new ApiError(404, "No channel found");

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Unsubscribed" }));

  } else {
    await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId
    })

    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Subscribed" }));
  }

})

//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

})

//controller to return channel list to which user has subscriber
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}
