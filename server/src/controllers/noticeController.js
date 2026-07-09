import Notice from "../models/Notice.js";

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

    // (Email to residents for important notices comes in Step 10)

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