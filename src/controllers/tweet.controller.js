import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { checkOwnership } from "../utils/checkOwnership.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //Todo: create Tweet
  try {
    const { content } = req.body;

    if (!content) throw new ApiError(401, "content is missing in tweet");

    const user = await User.findById(req.user?._id);

    if (!user) throw new ApiError(400, "Invalid request for tweet");

    const tweet = await Tweet.create({
      content,
      owner: user?._id
    });

    return res.status(200).json(
      new ApiResponse(200, tweet, "Tweet created successfully")
    );

  } catch (error) {
    throw new ApiError("failed to create tweet", error?.message)
  }

});

const getUserTweet = asyncHandler(async (req, res) => {
  //Todo: get user tweet
  const { userId } = req.params;

  if (!userId) throw new ApiError(401, "Invalid userId");

  // const tweet = await Tweet.find({ owner: userId }).populate('owner');

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
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
      $unwind: "$owner"
    }
  ])

  if (!tweet.length) throw new ApiError(404, "No tweet found for these user");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tweet,
        "Successfully fetched tweets for these user"
      )
    )
});

const updateTweet = asyncHandler(async (req, res) => {
  //Todo: update tweet
  const { newContent } = req.body;
  const { tweetId } = req.params;
  const { user } = req.user?._id;

  if (!newContent) throw new ApiError(400, "All fields are required");

  if (!tweetId) throw new ApiError(400, "tweetId not found");


  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      }
    },
    { new: true }
  )
  if(!updatedTweet) throw new ApiError(404, "failed to update tweet");
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "Tweet updated successfully!")
    );
})

const deleteTweet = asyncHandler(async (req, res) => {
  //Todo: delete tweet
    const { tweetId } = req.params;

    if (!tweetId) throw new ApiError(401, "Tweet not found");

    console.log('tweetId', tweetId)

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet) throw new ApiError(404, "No tweet found");

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Tweet deleted successfully")
      );
  
})


export {
  createTweet,
  getUserTweet,
  updateTweet,
  deleteTweet
}