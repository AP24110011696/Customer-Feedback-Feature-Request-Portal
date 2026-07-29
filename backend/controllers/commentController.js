const Comment = require('../models/Comment');
const FeatureRequest = require('../models/FeatureRequest');

/**
 * @desc   Create a comment on a feature request
 * @route  POST /api/comments/:requestId
 * @access Private
 */
const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const feature = await FeatureRequest.findById(req.params.requestId);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const comment = await Comment.create({
      requestId: req.params.requestId,
      userId: req.user._id,
      content: content.trim(),
    });

    const populated = await comment.populate('userId', 'username email');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('comment:new', {
        requestId: req.params.requestId,
        comment: populated,
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get all comments for a feature request
 * @route  GET /api/comments/:requestId
 * @access Private
 */
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ requestId: req.params.requestId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete comment (owner or admin only)
 * @route  DELETE /api/comments/:id
 * @access Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createComment, getComments, deleteComment };
