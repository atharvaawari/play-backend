import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
    [userName, email, fullName, password].some((field) => field?.trim() === "")  //some return true if any of the field is empty
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
  return res.status(201).json(
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

  const { email, userName, password } = req.body;

  if (!email || !userName) {
    throw new ApiError(400, "username or password is required");
  }

  // mogoDb operators are used for conditionally serch or any other operations 
  const user = await User.findOne({
    $or: [{ userName, email }]
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(user._id);

  const loggedInUser = User.findById(user._id).select("-password -refreshToken");

  // cookies are modifiable from client side for that reason we have to define options for cookies 
  const options = {
    httpOnly : true,  //for cookies can only modify by server
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
  )

})

export { registerUser, loginUser }