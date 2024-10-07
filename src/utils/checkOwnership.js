import { ApiError } from "./ApiError.js";

export const checkOwnership = (ownerId, userId, resource = "resource") =>{
  if(ownerId.toString() !== userId.toString()){
    throw new ApiError(403, `You are Not authorised to change this ${resource}`);
  }else{
    console.log("authorised owner");
  }
}