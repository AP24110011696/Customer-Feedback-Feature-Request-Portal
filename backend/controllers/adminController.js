const User = require('../models/User');
const Feedback = require('../models/Feedback');
const FeatureRequest = require('../models/FeatureRequest');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

/**
 * @desc   Aggregate analytics data for admin dashboard charts
 * @route  GET /api/admin/analytics
 * @access Private/Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFeedback,
      totalFeatures,
      totalVotes,
      totalComments,
    ] = await Promise.all([
      User.countDocuments(),
      Feedback.countDocuments(),
      FeatureRequest.countDocuments(),
      Vote.countDocuments(),
      Comment.countDocuments(),
    ]);

    // Feature status distribution
    const statusAgg = await FeatureRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Category distribution (features)
    const categoryAgg = await FeatureRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Sentiment distribution (feedback)
    const sentimentAgg = await Feedback.aggregate([
      { $group: { _id: '$sentiment.label', count: { $sum: 1 } } },
    ]);

    // Activity over last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const feedbackTrend = await Feedback.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const featureTrend = await FeatureRequest.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 trending feature requests
    const topFeatures = await FeatureRequest.find()
      .sort({ votes: -1 })
      .limit(5)
      .populate('createdBy', 'username');

    res.json({
      totals: {
        users: totalUsers,
        feedback: totalFeedback,
        features: totalFeatures,
        votes: totalVotes,
        comments: totalComments,
      },
      statusDistribution: statusAgg,
      categoryDistribution: categoryAgg,
      sentimentDistribution: sentimentAgg,
      feedbackTrend,
      featureTrend,
      topFeatures,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   List all users (admin)
 * @route  GET /api/admin/users
 * @access Private/Admin
 */
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Promote or demote a user
 * @route  PUT /api/admin/users/:id/role
 * @access Private/Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, listUsers, updateUserRole };
