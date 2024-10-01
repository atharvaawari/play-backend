import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const getAllVideos = asyncHandler(async (req, res) => {
   //  todo:get all videos based on query, sort, pagination
  // get data from the req.query 
  // verify the data is available
  //setup the pagination and sorting
  //create pipeline array and match object to get filtering params
  //Send response
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  const userId = req.user?._id;

  try {

    // if (!query) throw new ApiError(401, "query is missing");
    if (!userId) throw new ApiError(401, "Unauthoried user");

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = pageNumber * limit - limit;

    const sortDirection = {};

    sortDirection[sortBy] = sortType === 'asc' ? 1 : -1;

    const pipeline = []; //creating aggregation pipeline

    const filter = {}; //Match (filtering based on query or userId)

    if (query) {
      filter.title = { $regex: query, $options: "i" }; //case-insenstive search in the title
    }

    if (userId) {
      filter.userId = userId; //Filter by user id if provided
    }

    const list = await Video.find(filter)
      .limit(limitNumber)
      .skip(parseInt(offset));

    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limitNumber);


    console.log("videos", list)
    return res
      .status(200)
      .json(
        200,
        new ApiResponse(200, 
          { videos: list, totalPages, currentPage: parseInt(page) }
          , "All video pages are fetched successfully!")
      );

  } catch (error) {
    throw new ApiError(400, error, "Fetching videos data failed");

  }

})

const getAllVideoj = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const offset = page * limit - limit;

  // Define sort options based on sortBy and sortType
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  // Build filter query
  const filter = query
    ? {
        title: { $regex: query, $options: "i" },
      }
    : {};

  try {
    const list = await Video.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limit);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videos: list, totalPages, currentPage: pageNumber },
          "Videos fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching videos");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body;
    const userId = req.user?._id;
    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;

    console.log("req.body", req.body);
    console.log("req.filles", req.files);

    if ([title, description, videoFilePath, thumbnailFilePath].some(
      (field) => !field?.trim()
    )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existedTitle = await Video.findOne({ title });

    if (existedTitle) throw new ApiError(409, "title alreay existed");

    // try {
    //   videoFile = await uploadOnCloudinary(videoFilePath);
    //   console.log("uploaded videoFile", videoFile?.public_id)
    // } catch (error) {
    //   console.log("video file upload failed", error?.message)
    // }

    // try {
    //   thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    //   console.log("uploaded videoFile", thumbnail?.public_id);
    // } catch (error) {
    //   console.log("thumbnail file upload failed", error?.message)
    // }

    let videoFile;
    let thumbnail = "";

    videoFile = await uploadOnCloudinary(videoFilePath);
    if (!videoFile) throw new ApiError(400, "video uploading failed");

    thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    if (!thumbnail) throw new ApiError(400, "thumbnail uploading failed");


    const video = await Video.create({
      videoFile: videoFile?.url,
      thumbnail: thumbnail?.url,
      duration: videoFile?.duration,
      owner: userId,
      description,
      title,
    });

    if (!video) throw new ApiError(400, "video creating failed");

    const publishedVideo = await Video.findOne(video._id);

    if (!publishedVideo) throw new ApiError(500, "video publish failed");

    return res
      .status(200)
      .json(
        new ApiResponse(200, publishedVideo, "Video publish sucessfull!")
      );

  } catch (error) {

    throw new ApiError(400, `video publishing failed, ${error?.message}`);
  }

})

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params

  if (!videoId) throw new ApiError("invalid video request");

  const video = await Video.findById(videoId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "vedio fetched successfully!")
    );

});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;
  const { videoId } = req.params;
  const thumbnailFilePath = req.file?.path;

  if (!title || !description) throw new ApiError(401, "data too update missing");
  if (!videoId) throw new ApiError(400, "update video data failed");
  if (!thumbnailFilePath) throw new ApiError(400, "Thumbnail file is missing");

  const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!thumbnail.url) throw new ApiError(400, "Error while uploading new thumbnail");

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url
      }
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "video details updated successfully!")
    );

})

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "failed to delete video");

  const deletedVideo = Video.findByIdAndDelete(videoId);

  if (!deletedVideo) throw new ApiError(400, "failed deleting video");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "video deleted successfully!")
    );

})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(404, "Video not found");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video not found in database");

  const updatedVideo = Video.findByIdAndUpdate(
    videoId,
    { $set: { ispublished: !video.ispublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "video published successfully!")
    );

})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}