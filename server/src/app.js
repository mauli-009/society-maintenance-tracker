import express from "express";
import cors from "cors";
import multer from "multer";

import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";

const app = express();

// ----- Core middleware -----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Health check -----
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Society Maintenance Tracker API is running",
    timestamp: new Date().toISOString(),
  });
});

// ----- API routes -----
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);

// ----- Multer / upload error handler -----
// Must come AFTER routes so it catches errors thrown during file handling.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large. Max size is 5MB."
          : err.message,
    });
  }
  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }
  // Anything else → generic server error
  return res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// ----- 404 handler (last) -----
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;