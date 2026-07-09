import mongoose from "mongoose";

// Sub-schema for each status change entry
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no separate _id for each history entry
);

const complaintSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["Plumbing", "Electrical", "Cleaning", "Security", "Elevator", "Other"],
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    photoPublicId: {
      type: String, // Cloudinary public_id, needed for deletion later
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    statusHistory: [statusHistorySchema], // embedded array
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;