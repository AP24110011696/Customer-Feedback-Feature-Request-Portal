const FeatureRequest = require('../models/FeatureRequest');
const Vote = require('../models/Vote');
const { analyzeSentiment, autoCategorize, predictPopularity } = require('../utils/aiHelpers');

/**
 * @desc   Create a feature request
 * @route  POST /api/features
 * @access Private
 */
const createFeatureRequest = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const fullText = `${title} ${description}`;
    const sentiment = analyzeSentiment(fullText);
    const finalCategory = category || autoCategorize(fullText, 'feature');

    const feature = await FeatureRequest.create({
      title,
      description,
      category: finalCategory,
      sentiment,
      createdBy: req.user._id,
    });

    const populated = await feature.populate('createdBy', 'username email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   List feature requests with search, filter, sort
 * @route  GET /api/features
 * @access Private (but could be public — kept private to match spec)
 */
const getAllFeatureRequests = async (req, res, next) => {
  try {
    const { search, category, status, sort = 'trending' } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;

    let features = await FeatureRequest.find(filter).populate('createdBy', 'username email');

    // Sort options
    if (sort === 'newest') {
      features.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === 'oldest') {
      features.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sort === 'votes') {
      features.sort((a, b) => b.votes - a.votes);
    } else {
      // trending: combines votes + recency via the virtual
      features.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    // Attach voter ids so the frontend can mark "voted" state client-side
    const ids = features.map((f) => f._id);
    const votes = await Vote.find({ requestId: { $in: ids } }).select('requestId userId');
    const voteMap = {};
    for (const v of votes) {
      const key = v.requestId.toString();
      voteMap[key] = voteMap[key] || [];
      voteMap[key].push(v.userId.toString());
    }

    const enriched = features.map((f) => {
      const obj = f.toObject({ virtuals: true });
      obj.hasVoted = req.user
        ? (voteMap[f._id.toString()] || []).includes(req.user._id.toString())
        : false;
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get feature request by id
 * @route  GET /api/features/:id
 * @access Private
 */
const getFeatureRequestById = async (req, res, next) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id).populate(
      'createdBy',
      'username email'
    );
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const hasVoted = !!(await Vote.findOne({
      requestId: feature._id,
      userId: req.user._id,
    }));

    const obj = feature.toObject({ virtuals: true });
    obj.hasVoted = hasVoted;
    res.json(obj);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update status (admin) OR edit by owner
 * @route  PUT /api/features/:id
 * @access Private
 */
const updateFeatureRequest = async (req, res, next) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const isOwner = feature.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (req.body.status) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admins can update status' });
      }
      feature.status = req.body.status;
    }

    if (req.body.title || req.body.description) {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to edit' });
      }
      if (req.body.title) feature.title = req.body.title;
      if (req.body.description) feature.description = req.body.description;
    }

    if (req.body.category) feature.category = req.body.category;

    await feature.save();
    const populated = await feature.populate('createdBy', 'username email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete feature request. Owner or admin only.
 * @route  DELETE /api/features/:id
 * @access Private
 */
const deleteFeatureRequest = async (req, res, next) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const isOwner = feature.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    // Cascade delete votes for this request
    await Vote.deleteMany({ requestId: feature._id });
    await feature.deleteOne();
    res.json({ message: 'Feature request deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   AI popularity prediction for a feature (does not require creation)
 * @route  POST /api/features/predict
 * @access Private
 */
const predictFeaturePopularity = async (req, res, next) => {
  try {
    const { title = '', description = '' } = req.body;
    const text = `${title} ${description}`;
    const score = predictPopularity(text);
    const sentiment = analyzeSentiment(text);
    res.json({ predictedScore: score, sentiment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFeatureRequest,
  getAllFeatureRequests,
  getFeatureRequestById,
  updateFeatureRequest,
  deleteFeatureRequest,
  predictFeaturePopularity,
};
