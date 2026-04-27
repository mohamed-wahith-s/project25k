const express = require('express');
const { adminLogin, getAdminProfile, getUsers, getColleges } = require('../controllers/adminController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/profile', protectAdmin, getAdminProfile);
router.get('/users', protectAdmin, getUsers);
router.get('/colleges', protectAdmin, getColleges);

module.exports = router;
