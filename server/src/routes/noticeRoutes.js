import express from "express";
import {
  createNotice,
  getNotices,
  deleteNotice,
} from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

// All notice routes require login
router.use(protect);

// Any logged-in user can view notices
router.get("/", getNotices);

// Admin only
router.post("/", authorize("admin"), createNotice);
router.delete("/:id", authorize("admin"), validateObjectId(), deleteNotice);

export default router;