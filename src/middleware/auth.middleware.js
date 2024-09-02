import { jwt } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

// sometimes we can see the unuse parameter like res will replace with(req, _ , next)
export const verifyJWT = asyncHandler(async (req, res, next)=>{
  
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
  
    if(!token) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // we have assign the _id while generating accessToken ref from user model 
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken -"); 
  
    if(!user) throw new ApiError(401, "Invalid accessToken");
    
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid accessToken");
  }
})