const express = require('express');
const { registerUser, loginUser, updateProfile, updateTneaRank } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.patch('/profile/tnea-rank', protect, updateTneaRank);

module.exports = router;
