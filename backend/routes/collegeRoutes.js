const express = require('express');
const router = express.Router();
const { 
  getCollegesList, 
  getCollegeByCode, 
  getCollegeCatalog, 
  getCollegeDetails,
  getDepartments
} = require('../controllers/collegeController');

// Routes
router.post('/', getCollegesList);
router.post('/details', getCollegeByCode);

router.get('/', getCollegesList);
router.get('/departments', getDepartments);
router.get('/catalog', getCollegeCatalog);
router.get('/details/:college_code', getCollegeDetails);

module.exports = router;
