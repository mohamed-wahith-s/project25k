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
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    // Check if user already exists (by email)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
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
      .from('users')
      .insert([
        {
          username: name,
          email,
          phone: phone || null,
          password: hashedPassword,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone,
      isSubscribed: user.is_subscribed,
      token: generateToken(user.id),
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
    // Find user by email OR phone
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }

    return res.json({
      id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone,
      studentName: user.student_name,
      cutoff: user.cutoff,
      marks: user.marks,
      caste: user.caste,
      religion: user.religion,
      isSubscribed: user.is_subscribed,
      subscriptionPlan: user.subscription_plan,
      subscriptionMetadata: user.subscription_metadata,
      token: generateToken(user.id),
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
      subscription_metadata: metadata,
      updated_at: new Date().toISOString(),
    };

    // Also promote key fields to top-level columns for querying
    if (metadata.marks   !== undefined) updatePayload.marks    = parseFloat(metadata.marks)   || null;
    if (metadata.cutoff  !== undefined) updatePayload.cutoff   = parseFloat(metadata.cutoff)  || null;
    if (metadata.caste   !== undefined) updatePayload.caste    = metadata.caste   || null;
    if (metadata.religion !== undefined) updatePayload.religion = metadata.religion || null;
    if (metadata.counselingRank !== undefined) updatePayload.counseling_rank = parseInt(metadata.counselingRank) || null;
    if (metadata.address !== undefined) updatePayload.address  = metadata.address || null;
    if (metadata.dateOfBirth !== undefined) updatePayload.date_of_birth = metadata.dateOfBirth || null;
    if (metadata.alternatePhone !== undefined) updatePayload.alternate_phone = metadata.alternatePhone || null;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      id: updatedUser.id,
      name: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      studentName: updatedUser.student_name,
      cutoff: updatedUser.cutoff,
      marks: updatedUser.marks,
      caste: updatedUser.caste,
      religion: updatedUser.religion,
      isSubscribed: updatedUser.is_subscribed,
      subscriptionPlan: updatedUser.subscription_plan,
      subscriptionMetadata: updatedUser.subscription_metadata,
      token: generateToken(updatedUser.id),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile };
