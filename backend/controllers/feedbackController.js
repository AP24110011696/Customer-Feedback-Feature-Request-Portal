const Feedback = require('../models/Feedback');
const { analyzeSentiment, autoCategorize } = require('../utils/aiHelpers');

/**
 * @desc   Create feedback (Bug report / general feedback)
 * @route  POST /api/feedback
 * @access Private
 */
const createFeedback = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const fullText = `${title} ${description}`;
    const sentiment = analyzeSentiment(fullText);
    const finalCategory = category || autoCategorize(fullText, 'feedback');

    const feedback = await Feedback.create({
      title,
      description,
      category: finalCategory,
      sentiment,
      createdBy: req.user._id,
    });

    const populated = await feedback.populate('createdBy', 'username email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get all feedback with optional search/filter
 * @route  GET /api/feedback
 * @access Private
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const { search, category, sentiment, sort = 'newest' } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') filter.category = category;
    if (sentiment && sentiment !== 'all') filter['sentiment.label'] = sentiment;

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const feedback = await Feedback.find(filter)
      .populate('createdBy', 'username email')
      .sort(sortOption);

    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get one feedback by id
 * @route  GET /api/feedback/:id
 * @access Private
 */
const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate(
      'createdBy',
      'username email'
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete feedback. Owner or admin only.
 * @route  DELETE /api/feedback/:id
 * @access Private
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const isOwner = feedback.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
};
