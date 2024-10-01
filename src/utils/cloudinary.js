import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

//localFilePath -local file url will given to upload on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    const response = await cloudinary.uploader.upload
      (localFilePath, {
        resource_type: "auto"   //file type detect auto 
      })
      
    //file has uploaded success on cloudinary
    console.log("file is uploaded on cloudinary", response.url);

    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.log("cloudinary error")
    fs.unlinkSync(localFilePath) //remove the locally saved temprory file as the upload operation got failed
    return null;
  }
}

const deleteFromCloudinary = async (publicId) => {
  try {
   
    await cloudinary.uploader.destroy(publicId);

    console.log("delete from cloudinary", publicId);
    
  } catch (error) {
    console.log("Error deleting from cloudinary", error?.message)
    return null;
  }
}

export {uploadOnCloudinary, deleteFromCloudinary}