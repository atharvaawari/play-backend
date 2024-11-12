import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //Todo: toggle like on video

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "No video found");

  const isLiked = await Like.findOne({
    likeBy: req.user?._id,
    video: videoId
  })

  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { message: "unlike" }
        )
      )
  } else {
    await Like.create({
      likeBy: req.user?._id,
      video: videoId
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "like" }
        )
      )
  }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //Todo: toggle like on comment

  const comment = await Comment.findById(commentId);

  if (!comment) throw new ApiError(404, "No comment found");

  const isLiked = Like.findOne({
    likeBy: req.user?._id,
    comment: commentId
  })

  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Unliked" }
        )
      )
  } else {
    await Like.create({
      likeBy: req.user?._id,
      comment: commentId
    })
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Liked" }
        )
      )
  }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //Todo: toggle like on tweet

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) throw new ApiError(404, "No tweet found");

  const isLiked = await findOne({
    likeBy: req.user?._id,
    tweet: tweetId
  })

  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Unlike" }
        )
      )
  } else {
    await Like.create({
      likeBy: req.user?._id,
      tweet: tweetId
    })
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Liked" }
        )
      )
  }
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //Todo: get all liked video

  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              title: 1,
              thumbnail: 1,
              videoFile: 1,
              description: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
              "owner.username": 1,
              "owner.fullname": 1,
              "owner.avatar": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
  ]);
  return res.status(200).json(new ApiResponse(200, videos));
})