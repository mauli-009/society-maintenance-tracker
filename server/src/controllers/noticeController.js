import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { sendEmail, importantNoticeEmail } from "../utils/email.js";

// @desc    Create a notice (admin)
// @route   POST /api/notices
// @access  Private (admin)
export const createNotice = async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and content",
      });
    }

    const notice = await Notice.create({
      title,
      content,
      isImportant: Boolean(isImportant),
      postedBy: req.user._id,
    });

    // ---- If important, email all residents (best-effort) ----
    if (notice.isImportant) {
      // Fetch residents (only need name + email)
      const residents = await User.find({ role: "resident" }).select(
        "name email"
      );

      // Send to each resident — fire-and-forget, don't block the response
      residents.forEach((resident) => {
        if (resident.email) {
          const { subject, html } = importantNoticeEmail(
            resident.name,
            notice
          );
          sendEmail({ to: resident.email, subject, html });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Notice posted successfully",
      notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notices (important pinned to top)
// @route   GET /api/notices
// @access  Private (any logged-in user)
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("postedBy", "name role")
      .sort({
        isImportant: -1, // important (true) first → pinned to top
        createdAt: -1, // then newest first
      });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notice (admin)
// @route   DELETE /api/notices/:id
// @access  Private (admin)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notice deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};