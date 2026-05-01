const express = require('express');
const { getProfile, updateProfile, updateTneaRank } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/profile/tnea-rank', protect, updateTneaRank);

module.exports = router;
