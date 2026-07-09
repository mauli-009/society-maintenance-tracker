import cloudinary from "../config/cloudinary.js";

// Upload an in-memory file buffer to Cloudinary.
// Returns { url, publicId } on success.
export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "society-complaints", // keep uploads organized
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Push the buffer into the upload stream
    uploadStream.end(fileBuffer);
  });
};

// Delete an image from Cloudinary by its public_id
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};