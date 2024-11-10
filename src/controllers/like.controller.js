import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res)=>{
  const { videoId } = req.params
  //Todo: toggle like on video

})

const toggleCommentLike = asyncHandler(async (req, res)=> {
  const { commentId } = req.params;
  //Todo: toggle like on comment
})

const toggleTweetLike = asyncHandler(async (req, res)=> {
  const { tweetId } = req.params;
  //Todo: toggle like on tweet 
})

const getLikedVideos = asyncHandler(async (req, res)=> {
  //Todo: get all liked video
})