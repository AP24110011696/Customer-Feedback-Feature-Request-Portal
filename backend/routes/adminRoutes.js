const express = require('express');
const { getAnalytics, listUsers, updateUserRole } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, listUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;
