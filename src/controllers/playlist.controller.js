import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";



const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create Playlist

  if (!name || !description) throw new ApiError(401, "All feilds are required");

  const playlist = await Playlist.create({
    name,
    description
  })

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Successfully created playlist")
    );

})

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) throw new ApiError(401, "User not found");

  const userPlaylist = await Playlist.find(
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    })

  if (!userPlaylist) throw new ApiError(401, "Failed to fetch playlist.");

  res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "User playlist fetched successfully!")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) throw new ApiError(404, "No playlist found");

  const playlist = Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
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
            $unwind: "$owner",
          }
        ]
      }
    }
  ]);

  if (!playlist) throw new ApiError(404, "Playlist not found");

  res.status(200).json(
    new ApiResponse(200, playlist, "Playlist fetched sucessed!")
  );

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  // TODO: add video to the playlist

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(404, "Playlist not found.");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "video not found.");

  if (!playlist?.owner.equals(req.user?._id))
    throw new ApiError(401, "Unauthorized request");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist,
    {
      $addToSet: {
        videos: videoId
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) throw new ApiError(400, "Failed to add video to playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Add video to playlist sucess!")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //TODO: remove video playlist

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(401, "playlist not found");

  const isVideoInPlaylist = playlist.videos.include(videoId);

  if (!isVideoInPlaylist) throw new ApiError(404, "Video not found.");

  await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId }
    }, // Pull operator removes the videoId from videos array
    { new: true } // Return the updated document
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from playlist successfully")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: delete playlist

  if (!playlistId) throw new ApiError(401, "playlist not found");

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );

})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!name || !description) throw new ApiError(401, "All fields are required");

  if (!playlistId) throw new ApiError(401, "playlist not found");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description
      }
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
    );

})


export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}