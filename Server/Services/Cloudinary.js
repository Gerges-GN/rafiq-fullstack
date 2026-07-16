const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

const deleteFile = async (publicId, resourceType = "image") => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

const deleteFolder = async (folderPath) => {
  await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: "image" });
  await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: "raw" });
  await cloudinary.api.delete_folder(folderPath);
  return { status: "folder_deleted" };
};

module.exports = { uploadFile, deleteFile, deleteFolder, cloudinary };