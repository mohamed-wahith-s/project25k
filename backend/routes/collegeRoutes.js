const express = require('express');
const router = express.Router();
const { getCollegesList, getCollegeByCode } = require('../controllers/collegeController');

router.post('/', getCollegesList);
router.post('/details', getCollegeByCode);

module.exports = router;
