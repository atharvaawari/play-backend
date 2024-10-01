import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const createTweet = asyncHandler(async (req, res) => {
  //Todo: create Tweet
  const { content } = req.body;

  if (!content) throw new ApiError(401, "content is missing in tweet");

  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(400, "Invalid request for tweet");

  const tweet = await Tweet.create({
    content,
    owner: user?._id
  });

  return res.status(200).json(
    new ApiResponse(200, tweet, "Tweet created successfully")
  );

});

const getUserTweet = asyncHandler(async (req, res) => {
  //Todo: get user tweet
  const { userId } = req.params;

  if (!userId) throw new ApiError(401, "Invalid userId");

  const tweet = await Tweet.find({ owner: userId }).populate('owner');

  if (!tweet.length) throw new ApiError(404, "No tweet found for these user");

  return res
    .status(200)
    .json(
      200,
      tweet,
      "Successfully fetched tweets for these user"
    )
});

const updateTweet = asyncHandler(async (req, res) => {
  //Todo: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content) throw new ApiError(400, "All fields are required");

  if (!tweetId) throw new ApiError(400, "tweetId not found");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content
      }
    },
    { new: true }
  )

  return res.status(200, updatedTweet, "Tweet updated successfully!");
})

const deleteTweet = asyncHandler(async (req, res) => {
  //Todo: delete tweet

  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

  if (!deletedTweet) throw new ApiError(401, "failed to delete tweet");

  return res.status(200).json(
    new ApiResponse(200, tweetId, "Tweet deleted successfully")
  );
})


export {
  createTweet,
  getUserTweet,
  updateTweet,
  deleteTweet
}