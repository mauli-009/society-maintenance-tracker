import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updatePriority,
  updateStatus,
} from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

// All complaint routes require a logged-in user
router.use(protect);

// ----- Resident routes -----
router.post("/", createComplaint);
router.get("/my", getMyComplaints);

// ----- Admin routes -----
router.get("/", authorize("admin"), getAllComplaints);
router.patch(
  "/:id/priority",
  authorize("admin"),
  validateObjectId(),
  updatePriority
);
router.patch(
  "/:id/status",
  authorize("admin"),
  validateObjectId(),
  updateStatus
);

// Shared route (resident owner or admin) — keep LAST so it doesn't
// swallow /my or the admin sub-routes
router.get("/:id", validateObjectId(), getComplaintById);

export default router;