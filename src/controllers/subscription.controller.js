import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



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
      .json(
        new ApiResponse(
          200,
          { message: "Unsubscribed" }
        )
      );

  } else {
    await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Subscribed" }
        )
      );
  }

})

//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log("params", req.params);
  if (!mongoose.isValidObjectId(channelId)) throw new ApiError(400, "Invalid Channel Id");

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            }
          }
        ]
      }
    },
    {
      $unwind: "$subscriber"
    }
  ]);

  if (!subscribers) throw new ApiError(400, "No subscribers found.");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "fetched subscribers successfully"
      )
    )

})

//controller to return channel list to which user has subscriber
const getSubscribedChannels = asyncHandler(async (req, res) => {

  const { subscriberId } = req.params;

  console.log("subscriberId", req.params);

  if (!mongoose.isValidObjectId(subscriberId)) throw new ApiError(401, "Invalid subscriber id");

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribedChaneel",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$subscribedChaneel"
    }
  ]);

  if (!subscribedChannels) throw new ApiError(404, "No subscribers found");


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "successfully fetched subscribed channels"
      )
    );


})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}
