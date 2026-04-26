const express = require('express');
const router = express.Router();
const { protect, optionalAuth, requirePaid } = require('../middlewares/authMiddleware');
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

// ── Details routes ────────────────────────────────────────────
// optionalAuth + requirePaid: free colleges bypass subscription;
// paid colleges still require a valid JWT + active subscription.
router.get('/details/:college_code', optionalAuth, requirePaid, getCollegeDetails);
router.post('/details', optionalAuth, requirePaid, getCollegeByCode);

// ── Premium-only list routes (JWT + is_paid required) ─────────
router.get('/', protect, requirePaid, getCollegesList);
router.post('/', protect, requirePaid, getCollegesList);

module.exports = router;
