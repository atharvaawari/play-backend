import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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


  const { username, email, fullName, password } = req.body;

  if(
    [username, email, fullName, password].some((field)=> field?.trim() === "")  //some return true if any of the field is empty
  ){
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if(existedUser) throw new ApiError(409, "User already existed");

  console.log("body.file:", req.file);
  const avatarLocalPath = req.file?.avatar[0]?.path;
  const coverImgLocalPath = req.file?.coverImage[0]?.path;

  if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  //upload on Cloudinary
  const avatar =  await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if(!avatar) throw new ApiError(400, "Avatar file is required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  //check for user creation & removing unwanted fields using select
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!createdUser) throw new ApiError(500, "Registering user failed");

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully!!!")
  )

})

export { registerUser }