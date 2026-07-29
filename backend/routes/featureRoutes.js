const express = require('express');
const {
  createFeatureRequest,
  getAllFeatureRequests,
  getFeatureRequestById,
  updateFeatureRequest,
  deleteFeatureRequest,
  predictFeaturePopularity,
} = require('../controllers/featureRequestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/predict', protect, predictFeaturePopularity);

router.route('/').post(protect, createFeatureRequest).get(protect, getAllFeatureRequests);
router
  .route('/:id')
  .get(protect, getFeatureRequestById)
  .put(protect, updateFeatureRequest)
  .delete(protect, deleteFeatureRequest);

module.exports = router;
