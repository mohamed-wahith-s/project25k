const { supabase } = require('../db');

// ─────────────────────────────────────────────────────────────
//  Shared helper — fetch user_applications profile by email.
//  If the row does NOT exist yet (first login after signup),
//  we auto-create a minimal stub so the app never breaks.
// ─────────────────────────────────────────────────────────────
const getOrCreateProfile = async (user) => {
  try {
    const email = user.email;
    const metadata = user.user_metadata || {};
    const fullName = metadata.full_name || email.split('@')[0];
    const phone = metadata.phone || '0000000000';
    const dob = metadata.date_of_birth || '2000-01-01';

    // 1. Try to find the existing profile row
    const { data: existing, error: fetchError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // use maybeSingle so we get null instead of error when missing

    if (fetchError) {
      console.error('Error fetching profile:', fetchError.message);
      throw { status: 400, message: fetchError.message };
    }

    if (existing) return existing;

    // 2. Row missing (new Supabase user) — create a stub row
    console.log(`Creating new profile for ${email}`);
    const insertPayload = {
      email,
      full_name: fullName,
      mobile_number: phone,
      date_of_birth: dob,
      password: 'NO_PASSWORD_SUPABASE_AUTH' // legacy constraint
    };

    const { data: created, error: insertError } = await supabase
      .from('user_applications')
      .insert(insertPayload)
      .select()
      .maybeSingle();

    if (insertError) {
      // Bonus: Check for duplicate constraint violation
      if (insertError.code === '23505') {
        console.warn(`Duplicate user detected during creation for ${email}. Re-fetching.`);
        const { data: retryExisting } = await supabase
          .from('user_applications')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (retryExisting) return retryExisting;
      }
      console.error('auto-create profile error:', insertError.message);
      throw { status: 400, message: insertError.message };
    }

    return created;
  } catch (err) {
    if (err.status) throw err;
    console.error('Unexpected error in getOrCreateProfile:', err);
    throw { status: 500, message: 'Internal Server Error during profile creation.' };
  }
};

// ─────────────────────────────────────────────────────────────
//  Shared helper — compute subscription status
// ─────────────────────────────────────────────────────────────
const computeSubscription = async (user, email) => {
  let isSubscribed = false;
  let subscriptionExpiry = null;

  if (user.is_paid) {
    if (user.last_paid_date) {
      const paidDate  = new Date(user.last_paid_date);
      const expiryDate = new Date(paidDate);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      // Give 1 extra day of grace period to avoid timezone/midnight confusion
      expiryDate.setDate(expiryDate.getDate() + 1);

      if (new Date() <= expiryDate) {
        isSubscribed    = true;
        subscriptionExpiry = expiryDate.toISOString();
      } else {
        // Auto-expire subscription in DB
        await supabase
          .from('user_applications')
          .update({ is_paid: false, updated_at: new Date().toISOString() })
          .eq('email', email);
      }
    } else {
      // Legacy user with is_paid but no date — assume they are valid
      isSubscribed = true;
    }
  }

  return { isSubscribed, subscriptionExpiry };
};

// ─────────────────────────────────────────────────────────────
//  Shape a user row into the API response object
// ─────────────────────────────────────────────────────────────
const shapeUser = (u, extraSubscription = {}) => {
  let calcCutoff = u.cutoff_mark ?? null;
  if (u.physics_mark != null && u.chemistry_mark != null && u.maths_mark != null) {
    calcCutoff = (u.physics_mark / 2) + (u.chemistry_mark / 2) + u.maths_mark;
  }

  return {
    id:               u.user_id,
    name:             u.full_name,
    studentName:      u.full_name,
    email:            u.email,
    phone:            u.mobile_number,
    dob:              u.date_of_birth,
    caste:            u.caste_category,
    tnea_ranking:     u.tnea_ranking     ?? null,
    physics_mark:     u.physics_mark     ?? null,
    chemistry_mark:   u.chemistry_mark   ?? null,
    maths_mark:       u.maths_mark       ?? null,
    marks:            (u.physics_mark || 0) + (u.chemistry_mark || 0) + (u.maths_mark || 0) || null,
    cutoff:           calcCutoff,
    ...extraSubscription,
  };
};

// ─────────────────────────────────────────────────────────────
//  @route   GET /api/auth/profile
//  @access  Protected
//  req.user is the Supabase auth user object (has .email)
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(400).json({ message: 'No email found in user token.' });
    }

    const profile = await getOrCreateProfile(user);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found and could not be created.' });
    }

    const subscription = await computeSubscription(profile, user.email);

    return res.json(shapeUser(profile, subscription));
  } catch (err) {
    console.error('getProfile error:', err.message || err);
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   PUT /api/auth/profile
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { metadata } = req.body;
    const email = req.user.email;

    if (!metadata) {
      return res.status(400).json({ message: 'No metadata provided.' });
    }

    // Build the update payload from allowed fields only
    const payload = { updated_at: new Date().toISOString() };
    if (metadata.studentName  !== undefined) payload.full_name       = metadata.studentName;
    if (metadata.phone        !== undefined) payload.mobile_number   = metadata.phone;
    if (metadata.dob          !== undefined) payload.date_of_birth   = metadata.dob;
    if (metadata.physics_mark !== undefined) payload.physics_mark    = metadata.physics_mark === '' ? null : parseFloat(metadata.physics_mark);
    if (metadata.chemistry_mark !== undefined) payload.chemistry_mark = metadata.chemistry_mark === '' ? null : parseFloat(metadata.chemistry_mark);
    if (metadata.maths_mark   !== undefined) payload.maths_mark      = metadata.maths_mark === '' ? null : parseFloat(metadata.maths_mark);
    if (metadata.tnea_ranking !== undefined) payload.tnea_ranking    = metadata.tnea_ranking === '' ? null : parseInt(metadata.tnea_ranking, 10);
    if (metadata.caste        !== undefined) payload.caste_category  = metadata.caste;

    // Email changes are not allowed here — email is the identity key
    // Any email change must go through Supabase Auth

    const { data: u, error } = await supabase
      .from('user_applications')
      .update(payload)
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    if (!u) return res.status(404).json({ message: 'User not found.' });

    const subscription = await computeSubscription(u, email);

    return res.json(shapeUser(u, subscription));
  } catch (err) {
    console.error('updateProfile error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   PATCH /api/auth/profile/tnea-rank
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const updateTneaRank = async (req, res) => {
  try {
    const { tnea_ranking } = req.body;
    const email = req.user.email;

    if (tnea_ranking == null || tnea_ranking === '') {
      return res.status(400).json({ message: 'tnea_ranking is required.' });
    }

    const rankNum = parseInt(tnea_ranking, 10);
    if (isNaN(rankNum) || rankNum < 1) {
      return res.status(400).json({ message: 'tnea_ranking must be a positive integer.' });
    }

    const { data: u, error } = await supabase
      .from('user_applications')
      .update({ tnea_ranking: rankNum, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    if (!u) return res.status(404).json({ message: 'User not found.' });

    const subscription = await computeSubscription(u, email);

    return res.json(shapeUser(u, subscription));
  } catch (err) {
    console.error('updateTneaRank error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, updateTneaRank };
