import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path not provided");
    }
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("file is successfully uploaded on cloudinary", response.url);
    // unlink the file from local storage
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove file from local file system due to unsuccessful upload on cloudinary
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteOldImages = async (imageUrl) => {
  try {
    // check if url exists
    if (!imageUrl) {
      throw new Error("Path of image to be deleted not provided");
    }
    // Extract the public ID from the URL
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Delete the image from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);
    //
    if (response.result !== "ok") {
      throw new Error("Failed to delete the old image from Cloudinary");
    }

    return response;
  } catch (error) {
    throw new Error("Some error occurred while deleting existing avatar");
    return null;
  }
};

export { uploadOnCloudinary, deleteOldImages };
