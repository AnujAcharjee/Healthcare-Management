import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  } finally {
    // Clean up the local file regardless of success or failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

const deleteCloudinary = async (publicId) => {
  if (!publicId) return null;

  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return null;
  }
};

// delete all files in cloudinary in an array
const deleteArrayElements = async (arr) => {
  if (arr.length > 0) {
    for (const element of arr) {
      if (element.uploadedFile) {
        await deleteCloudinary(element.uploadedFile?.public_id);
      }
    }
  }
};

export { uploadCloudinary, deleteCloudinary, deleteArrayElements };
