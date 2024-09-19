import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //  todo:get all videos based on query, sort, pagination
  // get data from the req.query 
  // verify the data is available
  //setup the pagination and sorting
  //create pipeline array and match object to get filtering params
  //Send response

  try {

    if (!(userId || query || sortDirection)) throw new ApiError(401, "query or userId is missing");

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const sortDirection = sortType === 'asc' ? 1 : -1;

    const pipeline = []; //creating aggregation pipeline

    const match = {}; //Match (filtering based on query or userId)

    if (query) {
      match.title = { $regex: query, $options: "i" }; //case-insenstive search in the title
    }

    if (userId) {
      match.userId = userId; //Filter by user id if provided
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    if (sortDirection) {
      pipeline.push({
        $sort: {
          [sortBy]: sortDirection //Dynamic sort field and direction
        }
      });
    }

    //define the aggregation options
    const options = {
      page: pageNumber,
      limit: limitNumber
    };

    const videosResult = await Video.mongooseAggregatePaginate(Video.aggregate(pipeline), options)

    const videos = {
      total: videosResult.totalDocs,
      limit: videosResult.limit,
      page: videosResult.page,
      totalPages: videosResult.totalPages,
      data: videosResult.docs.map(video => ({
        _id: video._id,
        title: video.title,
        userId: video.userId,
        videoUrl: video.videoUrl,
        createdAt: video.createdAt,
      }))
    }

    return res
      .status(200)
      .json(
        200,
        videos,
        new ApiResponse(200, "All video pages are fetched successfully!")
      );

  } catch (error) {
    throw new ApiError(400, error, "Fetching videos data failed");

  }


})

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console("req.body", req.body);

  if (!(title || description)) return new ApiError(400, "All fiels are required");

  const existedTitle = await Video.findOne({ title });

  if (existedTitle) throw new ApiError(409, "title alreay existed");

  console.log("req.filles", req.filles);

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

  const createdVideo = await Video.findOne(video._id);

  if (!createdVideo) throw new ApiError(500, "video publish failed");

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdVideo, "Video publish successfull!")
    );

})


export { getAllVideos, publishAVideo }