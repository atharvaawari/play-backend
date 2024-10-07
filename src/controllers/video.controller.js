import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { validateObjectId } from "../utils/validateObjectId.js";


// const getAllVideos = asyncHandler(async (req, res) => {
//   //  todo:get all videos based on query, sort, pagination
//   // get data from the req.query 
//   // verify the data is available
//   //setup the pagination and sorting
//   //create pipeline array and match object to get filtering params
//   //Send response
//   const {
//     page = 1,
//     limit = 10,
//     query = "",
//     sortBy = "createdAt",
//     sortType = "desc",
//     userId
//   } = req.query;
//   const user = req.user?._id;

//   try {

//     // if (!query) throw new ApiError(401, "query is missing");
//     if (!user) throw new ApiError(401, "Unauthoried user");

//     const pageNumber = parseInt(page, 10) || 1;
//     const limitNumber = parseInt(limit, 10) || 10;
//     const offset = pageNumber * limit - limit;

//     const sortDirection = {};

//     sortDirection[sortBy] = sortType === 'asc' ? 1 : -1;

//     const filter = {}; //Match (filtering based on query or userId)

//     if (query) {
//       filter.title = { $regex: query, $options: "i" }; //case-insenstive search in the title
//     }

//     if (userId) {
//       filter.userId = userId; //Filter by user id if provided
//     }

//     const list = await Video.find(filter)
//       .sort(sortDirection)
//       .limit(limitNumber)
//       .skip(parseInt(offset));

//     const totalVideos = await Video.countDocuments(filter);
//     const totalPages = Math.ceil(totalVideos / limitNumber);


//     console.log("videos", list)
//     return res
//       .status(200)
//       .json(
//         200,
//         new ApiResponse(200,
//           { videos: list, totalPages, currentPage: parseInt(page) }
//           , "All video pages are fetched successfully!")
//       );

//   } catch (error) {
//     throw new ApiError(400, error, "Fetching videos data failed");

//   }

// })


const getAllVideos = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const matchCondition = {};

  // verify that the id should only userId
  if (userId) {
    matchCondition.owner = new mongoose.Types.ObjectId(userId);
    console.log("userID", userId)
    console.log("matchCondition.owner", matchCondition.owner)
  }

  //$regex is used for case-insensitive 
  if (query) {
    matchCondition.title = { $regex: query, $options: "i" };
  }

  // $match: Filters documents (videos) based on matchCondition
  // $lookup: similar to a join [videos, users]
  // matches owner field from the videos collection to the _id field in the users collection.
  // The as: "owner" part stores the result as an array in the owner field of the video document.
  // The pipeline option specifies further steps within the lookup. 
  // Here, only the fullName, username, and avatar fields of the users collection are returned.
  //$unwind: Since $lookup stores the result in an array, 
  // $unwind is used to deconstruct the array and return one document for each video-owner combination.
  // $skip: Implements pagination by skipping a certain number of documents. 
  // $limit: Limits the number of documents returned to the specified limit (default is 10).
  const videos = await Video.aggregate([
    {
      $match: matchCondition,
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
              fullName: 1,
              username: 1,
              avatar: 1,
            }
          }
        ]
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $sort: {
        [sortBy]: sortType == "asc" ? 1 : -1
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit)
    },
    {
      $limit: parseInt(limit)
    }
  ])

  return res.status(200).json(new ApiResponse(200, videos, "Video fetched successfully"));
})

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

    let videoFile;
    let thumbnail = "";

    videoFile = await uploadOnCloudinary(videoFilePath);
    thumbnail = await uploadOnCloudinary(thumbnailFilePath);

    if (!videoFile || !thumbnail) throw new ApiError(400, "Video uploading failed");


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

    if (videoFile) await deleteFromCloudinary(videoFile.public_id);
    if (thumbnail) await deleteFromCloudinary(thumbnail.public_id);

    throw new ApiError(400, `video publishing failed, ${error?.message}`);
  }

})

// const getVideoById = asyncHandler(async (req, res) => {
//   //TODO: get video by id
//   const { videoId } = req.params;

//   validateObjectId(videoId, "video");

//   const video = await Video.findById(videoId);

//   if (!video) throw new ApiError(404, "Video not found");

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, video, "vedio fetched successfully!")
//     );

// });

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  console.log(videoId)

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
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
      },
    },
    {
      $unwind: "$owner"
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "videos",
        as: "likes",
        pipeline: [
          {
            $project: {
              likeBy: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "videos",
        as: "comments",
      },
    },
    {
      $addFields: {
        comments: {
          $size: "$comments",
        },
      },
    }
  ])

  if(!video) throw new ApiError(404, "video not found");

  return res.status(200).json(
    new ApiResponse(200, video[0], "Video fetched success")
  );

})

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;
  const { videoId } = req.params;
  const thumbnailFilePath = req.file?.path;

  validateObjectId(videoId, "video");

  // if (!title || !description) throw new ApiError(401, "data too update missing");
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

  validateObjectId(videoId, "video");

  if (!videoId) throw new ApiError(400, "failed to delete video");

  const deletedVideo = await Video.findByIdAndDelete(videoId);
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