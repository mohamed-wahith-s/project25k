const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getCollegesList, getCollegeByCode } = require('../controllers/collegeController');

router.post('/', getCollegesList);
router.post('/details', getCollegeByCode);
=======
const { getColleges, getCollegeCatalog, getCollegeDetails } = require('../controllers/collegeController');

router.get('/', getColleges);
router.get('/catalog', getCollegeCatalog);
router.get('/details/:college_code', getCollegeDetails);
>>>>>>> 2378897 (Latest commit)

module.exports = router;
