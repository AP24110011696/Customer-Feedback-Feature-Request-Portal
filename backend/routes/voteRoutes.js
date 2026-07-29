const express = require('express');
const { toggleVote, getVoters } = require('../controllers/voteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:requestId', protect, toggleVote);
router.get('/:requestId', protect, adminOnly, getVoters);

module.exports = router;
