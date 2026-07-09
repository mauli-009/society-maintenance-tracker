import multer from "multer";

// Store the file in memory as a buffer (we forward it straight to Cloudinary,
// so we never need to write it to local disk).
const storage = multer.memoryStorage();

// Only allow image files, cap the size at 5MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;