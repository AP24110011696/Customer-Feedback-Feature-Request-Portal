const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:requestId').post(protect, createComment).get(protect, getComments);
router.delete('/comment/:id', protect, deleteComment);

module.exports = router;
