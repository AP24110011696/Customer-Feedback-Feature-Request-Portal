const Vote = require('../models/Vote');
const FeatureRequest = require('../models/FeatureRequest');

/**
 * @desc   Toggle a vote on a feature request.
 *         If user hasn't voted -> add vote. Else -> remove it.
 * @route  POST /api/votes/:requestId
 * @access Private
 */
const toggleVote = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const feature = await FeatureRequest.findById(requestId);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const existing = await Vote.findOne({ requestId, userId });

    let action;
    if (existing) {
      await existing.deleteOne();
      feature.votes = Math.max(0, feature.votes - 1);
      action = 'removed';
    } else {
      await Vote.create({ requestId, userId });
      feature.votes += 1;
      action = 'added';
    }
    await feature.save();

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('vote:update', {
        requestId: feature._id.toString(),
        votes: feature.votes,
        action,
      });
    }

    res.json({
      message: `Vote ${action}`,
      votes: feature.votes,
      hasVoted: action === 'added',
    });
  } catch (err) {
    // Handle duplicate vote race condition cleanly
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already voted for this request' });
    }
    next(err);
  }
};

/**
 * @desc   Get voters list for a request (admin only)
 * @route  GET /api/votes/:requestId
 * @access Private/Admin
 */
const getVoters = async (req, res, next) => {
  try {
    const votes = await Vote.find({ requestId: req.params.requestId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(votes);
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleVote, getVoters };
