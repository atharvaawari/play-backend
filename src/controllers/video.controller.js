import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.querry;
  //  
})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title || description)) return new ApiError(400, "All fiels are required");

  const existedTitle = await Video.findOne({ title });

  if (existedTitle) throw new ApiError(409, "title alreay existed");

  const videoFilePath = req.filles?.videoFile[0]?.path;

  const thumbnailFilePath = req.filles?.thumbnail[0]?.path;

  if (!(videoFilePath && thumbnailFilePath)) {
    throw new ApiError(400, "video file or thumbnail file is missing");
  }

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!videoFile) throw new ApiError(400, "video File is required");
  if (!thumbnail) throw new ApiError(400, "thumbnail is required");


  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    description: description,
    title: title,
  });

  const createdVideo = Video.findOne(video._id);

  if (!createdVideo) throw new ApiError(500, "video publish failed");

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdVideo, "Video publish successfull!")
    );

})


export { getAllVideos, publishAVideo }