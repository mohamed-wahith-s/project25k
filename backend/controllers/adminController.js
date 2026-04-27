const { supabase } = require('../db');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/admin/login
//  @access  Public
// ─────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Invalid email ' });
    }

    // Direct password verification (no bcrypt)
    if (password !== admin.password) {
      return res.status(401).json({ success: false, error: 'Invalid  password.' });
    }

    // Update last_login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('admin_id', admin.admin_id);

    return res.json({
      success: true,
      token: generateToken(admin.admin_id),
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      }
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   GET /api/admin/profile
//  @access  Protected (Admin)
// ─────────────────────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('admin_id, email, full_name, role, created_at')
      .eq('admin_id', adminId)
      .single();

    if (error || !admin) {
      return res.status(404).json({ success: false, error: 'Admin not found.' });
    }

    return res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Admin profile error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   GET /api/admin/users
//  @access  Protected (Admin)
// ─────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('user_applications')
      .select('user_id, full_name, father_name, email, mobile_number, alternative_mobile, date_of_birth, address, caste_category, board_of_study, exam_roll_no, physics_mark, chemistry_mark, maths_mark, tnea_ranking, is_paid, last_paid_date, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin get users error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   GET /api/admin/colleges
//  @access  Protected (Admin)
// ─────────────────────────────────────────────────────────────
const getColleges = async (req, res) => {
  try {
    const { data: colleges, error } = await supabase
      .from('colleges')
      .select('college_code, college_name, college_address')
      .order('college_name', { ascending: true });

    if (error) throw error;

    return res.json({ success: true, data: colleges });
  } catch (error) {
    console.error('Admin get colleges error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { adminLogin, getAdminProfile, getUsers, getColleges };
