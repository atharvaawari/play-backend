import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";



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

  const userPlaylist = await Playlist.aggregate([
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
        as: "owner"
      },
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
    {
      $unwind: "$owner"
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "playlists",
        as: "likes",
        pipeline: [
          {
            $project: {
              likeBy: 1
            }
          }
        ]
      }
    },
  ])

  if (!userPlaylist) throw new ApiError(401, "Failed to fetch playlist.");

  res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "User playlist fetched successfully!")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  //TODO: get playlist by id

  if(!playlistId) throw new ApiError(404, "No playlist found"); 

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { PlaylistId, videoId } = req.params
  // TODO: add video to the playlist
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //TODO: remove video playlist
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

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