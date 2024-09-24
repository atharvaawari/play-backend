import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const createTweet = asyncHandler(async (req, res) => {
  //Todo: create Tweet
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

});

const getUserTweet = asyncHandler(async (req, res)=>{
  
})


export {
  createTweet,
}