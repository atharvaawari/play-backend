import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkOwnership } from "../utils/checkOwnership.js";


const getVideoComments = asyncHandler(async (req, res)=>{
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query;

  if(!videoId) throw new ApiError(400, "video not found");

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      } 
    },
    {
      $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"owner",
        pipeline:[
          { 
           $project:{
            userName: 1,
            fullName: 1,
            avatar: 1  
           }  
          }
        ]
      }
    },
    {
      $unwind:"$owner"
    },
    {
      $lookup: {
        from:"likes",
        localField:"_id",
        foreignField:'comment',
        as: "likes",
        pipeline:[
          {
            $project:{
              likeBy:1,
            }
          }
        ]
      }
    },
    {
      $skip: ( parseInt(page) - 1 ) * (parseInt(limit)), 
    },
    {
      $limit: parseInt(limit)
    }
  ])

  if(!comments) throw new ApiError(404, "Comment not found");

  return res.status(200).json( new ApiResponse(200, comments, "Successfully fetched comments!"));

})

const addComment = asyncHandler(async (req, res)=>{
  // TODO: Add a comment to a video 

  const { content } = req.body ;
  const { videoId }  = req.params;

  if(!content) throw new ApiError(400, "comment is required");

  if(!videoId) throw new ApiError(400, "Video not found.");

   const newComment = await Comment.create({
    video: videoId,
    owner: req.user?._id,
    content,
   })

   if(!newComment) throw new ApiError(402, "creating comment failed.");
   
   res.status(200).json(new ApiResponse(200, newComment, "Successfully created comment!"));

})

const updateComment = asyncHandler(async (req, res)=>{
  //TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;

  if(!commentId) throw new ApiError(404, "comment not found");
  
  if(!content) throw new ApiError(404, "comment required");

  const newComment = await Comment.findByIdAndUpdate(  
    commentId,
    {
      $set:{
        content
      }
    },
    { new: true}
  )
  if(!newComment) throw new ApiError(401, "failed to update comment");

  res.status(200).json( new ApiResponse(200, newComment, "successfully updated comment!"));

})

const deleteComment = asyncHandler(async (req, res)=> {
  //TODO: delete a comment

  const { commentId } = req.params;

  if(!commentId) throw new ApiError(404, "Comment not found.");

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if(!deletedComment) throw new ApiError(401, "comment deletion failed");

  res.status(200).json( new ApiResponse(200, deletedComment, "sucessfully deleted comment!"));

})


export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}