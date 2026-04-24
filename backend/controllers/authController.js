const { supabase } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/auth/register
//  @access  Public
// ─────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, phone, password, date_of_birth } = req.body;

  if (!name || !email || !password || !date_of_birth) {
    return res.status(400).json({ message: 'Name, email, password, and Date of Birth are required.' });
  }

  try {
    // Check if user already exists (by email)
    const { data: existingUser } = await supabase
      .from('user_applications')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const { data: user, error } = await supabase
      .from('user_applications')
      .insert([
        {
          full_name: name,
          email,
          mobile_number: phone || null,
          date_of_birth,
          password: hashedPassword,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.mobile_number,
      dob: user.date_of_birth,
      isSubscribed: user.is_paid,
      token: generateToken(user.user_id),
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/auth/login
//  @access  Public
// ─────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email or phone

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier (email/phone) and password are required.' });
  }

  try {
    console.log('Login attempt for:', identifier);
    // Find user by email OR phone
    const { data: user, error } = await supabase
      .from('user_applications')
      .select('*')
      .or(`email.eq."${identifier}",mobile_number.eq."${identifier}"`)
      .single();

    if (error) {
      console.log('User search error:', error.message);
    }

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    return res.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.mobile_number,
      studentName: user.full_name,
      cutoff: user.cutoff_mark || null,
      marks: user.physics_mark + user.chemistry_mark + user.maths_mark || null,
      caste: user.caste_category,
      dob: user.date_of_birth,
      isSubscribed: user.is_paid,
      token: generateToken(user.user_id),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   PUT /api/auth/profile
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { metadata } = req.body;
    const userId = req.user.id;

    if (!metadata) {
      return res.status(400).json({ message: 'No metadata provided.' });
    }

    // Build update payload — map metadata fields to DB columns
    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (metadata.studentName) updatePayload.full_name = metadata.studentName;
    if (metadata.physics_mark) updatePayload.physics_mark = metadata.physics_mark;
    if (metadata.chemistry_mark) updatePayload.chemistry_mark = metadata.chemistry_mark;
    if (metadata.maths_mark) updatePayload.maths_mark = metadata.maths_mark;
    if (metadata.caste) updatePayload.caste_category = metadata.caste;

    const { data: updatedUser, error } = await supabase
      .from('user_applications')
      .update(updatePayload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      id: updatedUser.user_id,
      name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.mobile_number,
      studentName: updatedUser.full_name,
      isSubscribed: updatedUser.is_paid,
      token: generateToken(updatedUser.user_id),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile };
