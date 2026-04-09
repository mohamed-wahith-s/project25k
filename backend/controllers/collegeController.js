const { College, Department } = require('../models/College');
const { Op } = require('sequelize');

// @desc    Get all colleges with their departments and optional filtering
// @route   GET /api/colleges
// @access  Public
exports.getColleges = async (req, res) => {
  try {
    const { department, search } = req.query;

    let departmentWhere = {};
    if (department && department !== 'All') {
      departmentWhere = { branchName: { [Op.iLike]: `%${department}%` } };
    }

    let collegeWhere = {};
    if (search) {
      collegeWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
          { district: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const colleges = await College.findAll({
      where: collegeWhere,
      include: [
        {
          model: Department,
          as: 'branches',
          where: Object.keys(departmentWhere).length > 0 ? departmentWhere : undefined,
          required: Object.keys(departmentWhere).length > 0 // Only return colleges that have the matching department
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json(colleges);
  } catch (err) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ message: 'Server error while fetching colleges' });
  }
};
