const express = require('express');
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createFeedback).get(protect, getAllFeedback);
router.route('/:id').get(protect, getFeedbackById).delete(protect, deleteFeedback);

module.exports = router;
