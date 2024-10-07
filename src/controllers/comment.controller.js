import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkOwnership } from "../utils/checkOwnership.js";


const getVideoComments = asyncHandler(async (req, res)=>{
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  if(!videoId) throw new ApiError(400, "video not found");

})


const addComment = asyncHandler(async (req, res)=>{
  // TODO: Add a comment to a video 


})

const updateComment = asyncHandler(async (req, res)=>{
  //TODO: update a comment

})


const deleteComment = asyncHandler(async (req, res)=> {
  //TODO: delete a comment

})


export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}