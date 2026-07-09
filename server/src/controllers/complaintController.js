import Complaint from "../models/Complaint.js";

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (resident)
export const createComplaint = async (req, res) => {
  try {
    const { category, description, photoUrl, photoPublicId } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide category and description",
      });
    }

    const complaint = await Complaint.create({
      resident: req.user._id,
      category,
      description,
      photoUrl: photoUrl || "",
      photoPublicId: photoPublicId || "",
      status: "Open",
      // seed the first history entry so the audit trail starts at creation
      statusHistory: [
        {
          status: "Open",
          note: "Complaint created",
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Complaint raised successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints for the logged-in resident
// @route   GET /api/complaints/my
// @access  Private (resident)
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ resident: req.user._id })
      .sort({ createdAt: -1 }) // newest first
      .populate("statusHistory.changedBy", "name role");

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single complaint by ID (with full status history)
// @route   GET /api/complaints/:id
// @access  Private (resident owns it, or admin)
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("resident", "name email flatNumber")
      .populate("statusHistory.changedBy", "name role");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Ownership check: a resident can only view their own complaint.
    // Admins can view any complaint.
    const isOwner =
      complaint.resident._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this complaint",
      });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all complaints (admin) with optional filters
// @route   GET /api/complaints
// @access  Private (admin)
export const getAllComplaints = async (req, res) => {
  try {
    const { category, status, priority, startDate, endDate } = req.query;

    // Build a dynamic filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Date range filter on createdAt
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        // include the whole end day by pushing to end of that day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const complaints = await Complaint.find(filter)
      .populate("resident", "name email flatNumber")
      .sort({
        isOverdue: -1, // overdue complaints surface at the top
        priority: 1, // (secondary — note: string sort, refined below)
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint priority (admin)
// @route   PATCH /api/complaints/:id/priority
// @access  Private (admin)
export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be Low, Medium, or High",
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    if (complaint.isClosed) {
      return res.status(400).json({
        success: false,
        message: "Cannot update priority of a closed complaint",
      });
    }

    complaint.priority = priority;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Priority updated",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (admin) — appends to history
// @route   PATCH /api/complaints/:id/status
// @access  Private (admin)
export const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Open, In Progress, or Resolved",
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Once resolved/closed, no further status changes allowed
    if (complaint.isClosed) {
      return res.status(400).json({
        success: false,
        message: "This complaint is already resolved and closed",
      });
    }

    // Update the current status
    complaint.status = status;

    // Append to the audit history
    complaint.statusHistory.push({
      status,
      note: note || "",
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    // If resolved, close the complaint and stamp the time
    if (status === "Resolved") {
      complaint.isClosed = true;
      complaint.resolvedAt = new Date();
      complaint.isOverdue = false; // resolved complaints are no longer overdue
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};