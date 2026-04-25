const express = require('express');
const router = express.Router();
const { protect, requirePaid } = require('../middlewares/authMiddleware');
const { 
  getCollegesList, 
  getCollegeByCode, 
  getCollegeCatalog, 
  getCollegeDetails,
  getDepartments
} = require('../controllers/collegeController');

// ── Public routes (no auth needed) ──────────────────────────
router.get('/departments', getDepartments);
router.get('/catalog', getCollegeCatalog);

// ── Premium routes (JWT + is_paid required) ──────────────────
// Full cutoff data list & college details require an active subscription
router.get('/', protect, requirePaid, getCollegesList);
router.post('/', protect, requirePaid, getCollegesList);
router.get('/details/:college_code', protect, requirePaid, getCollegeDetails);
router.post('/details', protect, requirePaid, getCollegeByCode);

module.exports = router;
