import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import verify from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false }); //to save refresh token in db

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "generating refresh and access token failed");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // registerUser
  //step-1 get user data from frontend using body 
  //step-2 validation
  //step-3 check user already exists with uniqe email
  //step-4 check for image, check for avatar
  //step-5 upload image on cloudinary, avatar 
  //step-6 create user object - create entry in db
  //remove password and refreshToken field from response
  //check for user creation 
  //return response 


  const { userName, email, fullName, password } = req.body;
  // console.log("req.body", req.body);

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")  //some return true if any of the field is not empty
  ) {
    throw new ApiError(400, "All fields are required")
  };

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }]
  });

  if (existedUser) throw new ApiError(409, "User already existed");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImgLocalPath = req.files?.coverImage[0]?.path;  //in this line the quemark is checking and directly set value in variable

  let coverImgLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImgLocalPath = req.files.coverImage[0].path;
  }

  // console.log("req.file:", req.files, "coverImgLocalPath", coverImgLocalPath);
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  //upload on Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar file is required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  });

  //check for user creation & removing unwanted fields using select
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) throw new ApiError(500, "Registering user failed");

  //return created user 
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User registered Successfully!!!")
    );

})

const loginUser = asyncHandler(async (req, res) => {
  //get data of from req.body
  //username or email, password 
  //check for fields are empty or user is register in database or not[check user]
  //check password
  //asign the refresh and access token to user login save it on cokkies
  //check in the cookies for access token or refresh
  //response of access & refresh token and loggedInUser  

  const { email, userName, password } = req.body;
  console.log("req.body", req.body);

  //this is how check for data with or operator
  if (!(email || userName)) {
    throw new ApiError(400, "username or password is required");
  }

  // mogoDb operators are used for conditionally serch or any other operations 
  const user = await User.findOne({
    $or: [{ userName }, { email }]
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // cookies are modifiable from client side for that reason we have to define options for cookies 
  const options = {
    httpOnly: true,  //for cookies can only modify by server
    secure: true
  }

  //sending response of accessToken and refreshToken is optional if user want to set in localstorage etc 

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In successfully!!!"
      )
    );

});

// pass new: true to get response of updated refreshToken
const logoutUser = asyncHandler(async (req, res) => {
  //for logout we need to clear refreshToken from DB
  //we are getting user _id from the middleware auth

  await User.findByIdAndUpdate(req.user._id,
    {
      // $set: {
      //   refreshToken: undefined,
      // },
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,  //for cookies can only modify by server
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incommingRefreshToken) throw new ApiError(401, "unauthorized request");

  try {
    const decodedToken = verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id)

    if (!user) throw new ApiError(401, "invalid refresh token");

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "AccessToken refresh successfully"
        )
      )
  } catch (error) {
    if (error) throw new res.ApiError(401, error?.message || "Invalid refresh token")
  }

})

const changeCurrentUserPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password change successfully!"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully!!"))
})

const updatedUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) throw new ApiError(400, "All feilds are required");

  //if we do new: true then after updated info get return
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    { new: true }

  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Acount details updated sucessfully."));

})

const updateduserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) return new ApiError(400, "Avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) return new ApiError(400, "Error while uploading avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url }
    },
    { new: true }
  ).select("-password");


  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated sucessfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) return new ApiError(400, "Cover image file is missing");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) return new ApiError(400, "Error while uploading cover image");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated sucessfully"))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params

  if (!userName?.trim()) throw new ApiError(400, "UserName us missing");

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])

  if (!channel?.length) throw new ApiError(400, "channel does not exists");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully!")
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully!"
      )
    )
})




export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updatedUserDetails,
  updateduserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}