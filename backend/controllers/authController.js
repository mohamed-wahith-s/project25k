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

  console.log('Registration attempt:', { name, email, phone, date_of_birth });

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

    if (error) {
      console.error('Insert error details:', error);
      throw error;
    }

    // New users are never paid at registration
    return res.status(201).json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.mobile_number,
      studentName: user.full_name,
      dob: user.date_of_birth,
      tnea_ranking: null,
      isSubscribed: false,
      subscriptionExpiry: null,
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
      .or(`email.eq.${identifier},mobile_number.eq.${identifier}`)
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

    // ── Subscription check: is_paid + 3-month window ──
    let isSubscribed = false;
    let subscriptionExpiry = null;

    if (user.is_paid && user.last_paid_date) {
      const paidDate = new Date(user.last_paid_date);
      const expiryDate = new Date(paidDate);
      expiryDate.setMonth(expiryDate.getMonth() + 3);

      if (new Date() <= expiryDate) {
        isSubscribed = true;
        subscriptionExpiry = expiryDate.toISOString();
      } else {
        // Auto-expire: flip is_paid to false in DB
        await supabase
          .from('user_applications')
          .update({ is_paid: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.user_id);
      }
    }

    return res.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.mobile_number,
      studentName: user.full_name,
      cutoff: user.cutoff_mark || null,
      physics_mark: user.physics_mark ?? null,
      chemistry_mark: user.chemistry_mark ?? null,
      maths_mark: user.maths_mark ?? null,
      marks: (user.physics_mark || 0) + (user.chemistry_mark || 0) + (user.maths_mark || 0) || null,
      caste: user.caste_category,
      dob: user.date_of_birth,
      tnea_ranking: user.tnea_ranking || null,
      isSubscribed,
      subscriptionExpiry,
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

    // Build update payload — map metadata fields → DB columns
    const updatePayload = { updated_at: new Date().toISOString() };

    // ── Basic Info (all users) ───────────────────────────────
    if (metadata.studentName)   updatePayload.full_name      = metadata.studentName;
    if (metadata.email)         updatePayload.email          = metadata.email;
    if (metadata.phone)         updatePayload.mobile_number  = metadata.phone;
    if (metadata.dob)           updatePayload.date_of_birth  = metadata.dob;

    // ── Academic Info (premium users — enforced on frontend,
    //    backend still accepts them; add requirePaid here if needed) ──
    if (metadata.physics_mark    !== undefined) updatePayload.physics_mark    = metadata.physics_mark === '' ? null : parseFloat(metadata.physics_mark);
    if (metadata.chemistry_mark  !== undefined) updatePayload.chemistry_mark  = metadata.chemistry_mark === '' ? null : parseFloat(metadata.chemistry_mark);
    if (metadata.maths_mark      !== undefined) updatePayload.maths_mark      = metadata.maths_mark === '' ? null : parseFloat(metadata.maths_mark);
    if (metadata.tnea_ranking    !== undefined) updatePayload.tnea_ranking    = metadata.tnea_ranking === '' ? null : parseInt(metadata.tnea_ranking, 10);
    if (metadata.caste           !== undefined) updatePayload.caste_category  = metadata.caste;

    const { data: u, error } = await supabase
      .from('user_applications')
      .update(updatePayload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!u) return res.status(404).json({ message: 'User not found.' });

    // Recompute subscription status
    let isSubscribed = false;
    let subscriptionExpiry = null;
    if (u.is_paid && u.last_paid_date) {
      const expiryDate = new Date(u.last_paid_date);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      if (new Date() <= expiryDate) {
        isSubscribed = true;
        subscriptionExpiry = expiryDate.toISOString();
      }
    }

    return res.json({
      id:                 u.user_id,
      name:               u.full_name,
      studentName:        u.full_name,
      email:              u.email,
      phone:              u.mobile_number,
      dob:                u.date_of_birth,
      caste:              u.caste_category,
      tnea_ranking:       u.tnea_ranking      ?? null,
      physics_mark:       u.physics_mark      ?? null,
      chemistry_mark:     u.chemistry_mark    ?? null,
      maths_mark:         u.maths_mark        ?? null,
      cutoff:             u.cutoff_mark       ?? null,
      isSubscribed,
      subscriptionExpiry,
      token: generateToken(u.user_id),
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
//  @route   PATCH /api/auth/profile/tnea-rank
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const updateTneaRank = async (req, res) => {
  try {
    const { tnea_ranking } = req.body;
    const userId = req.user.id;

    if (tnea_ranking === undefined || tnea_ranking === null || tnea_ranking === '') {
      return res.status(400).json({ message: 'tnea_ranking is required.' });
    }

    const rankNum = parseInt(tnea_ranking, 10);
    if (isNaN(rankNum) || rankNum < 1) {
      return res.status(400).json({ message: 'tnea_ranking must be a positive integer.' });
    }

    const { data: updatedUser, error } = await supabase
      .from('user_applications')
      .update({ tnea_ranking: rankNum, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    let isSubscribed = false;
    if (updatedUser.is_paid && updatedUser.last_paid_date) {
      const paidDate = new Date(updatedUser.last_paid_date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (paidDate > threeMonthsAgo) isSubscribed = true;
    }

    return res.json({
      id: updatedUser.user_id,
      name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.mobile_number,
      studentName: updatedUser.full_name,
      tnea_ranking: updatedUser.tnea_ranking,
      isSubscribed,
      token: generateToken(updatedUser.user_id),
    });
  } catch (error) {
    console.error('Update TNEA rank error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile, updateTneaRank };
