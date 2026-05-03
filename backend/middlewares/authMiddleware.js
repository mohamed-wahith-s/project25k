const { supabase } = require('../db');

// ─────────────────────────────────────────────────────────────
//  FREE_COLLEGE_CODES — these colleges are accessible to all
//  users regardless of subscription status.
// ─────────────────────────────────────────────────────────────
const FREE_COLLEGE_CODES = new Set([
  '1', '4', '2005', '2006', '2007',
  '5008', '1414', '2712', '1399', '2718',
]);

/**
 * Normalise a college code by stripping leading zeros so that
 * '01', '1', '001' all resolve to '1'.
 */
const normaliseCode = (code) => String(code || '').replace(/^0+/, '') || String(code || '');

const isFreeCollege = (code) => FREE_COLLEGE_CODES.has(normaliseCode(code));

// ─────────────────────────────────────────────────────────────
//  protect — verifies Supabase JWT, attaches req.user = { id }
// ─────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Use Supabase to verify the JWT
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      req.user = user; // { id (uuid), aud, role, email, ... }
      next();
    } catch (error) {
      console.error('Protect middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ─────────────────────────────────────────────────────────────
//  optionalAuth — attaches req.user if a valid Supabase JWT is present
//  but does NOT block the request if there is no token.
//  Use this on routes that are public but benefit from knowing
//  who the caller is (e.g. free-college detail routes).
// ─────────────────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
         req.user = user;
      }
    } catch (_) {
      // invalid token — treat as unauthenticated
    }
  }
  next();
};

// ─────────────────────────────────────────────────────────────
//  requirePaid — must run AFTER protect
//  Checks is_paid = true AND last_paid_date within 3 months.
//  If subscription has expired it auto-flips is_paid → false
//  in the DB before returning 403.
// ─────────────────────────────────────────────────────────────
const requirePaid = async (req, res, next) => {
  try {
    // ── Free-college bypass ────────────────────────────────────
    // Resolve the college code from params or body
    const requestedCode = req.params?.college_code || req.body?.code || req.query?.college_code;
    if (requestedCode && isFreeCollege(requestedCode)) {
      // This is a whitelisted free college — allow without subscription
      return next();
    }

    // ── Standard subscription check ───────────────────────────
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const { data: user, error } = await supabase
      .from('user_applications')
      .select('is_paid, last_paid_date')
      .eq('email', req.user.email)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Not paid at all
    if (!user.is_paid) {
      return res.status(403).json({
        message: 'Premium subscription required.',
        expired: false,
      });
    }

    // Paid — check 3-month window
    if (user.last_paid_date) {
      const paidDate = new Date(user.last_paid_date);
      const expiryDate = new Date(paidDate);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      // Give 1 extra day of grace period to avoid timezone/midnight confusion
      expiryDate.setDate(expiryDate.getDate() + 1);

      if (new Date() > expiryDate) {
        // Subscription expired — auto-flip is_paid to false
        await supabase
          .from('user_applications')
          .update({ is_paid: false, updated_at: new Date().toISOString() })
          .eq('email', req.user.email);

        return res.status(403).json({
          message: 'Your 3-month subscription has expired. Please renew.',
          expired: true,
        });
      }
    }

    // All good
    next();
  } catch (err) {
    console.error('requirePaid error:', err.message);
    return res.status(500).json({ message: 'Server error during subscription check.' });
  }
};

// ─────────────────────────────────────────────────────────────
//  protectAdmin — verifies JWT, ensures user is in admin_users
// ─────────────────────────────────────────────────────────────
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Note: We are keeping the old custom JWT for admins
      const jwt = require('jsonwebtoken'); // Require it here just for admins
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify admin exists in db
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('admin_id')
        .eq('admin_id', decoded.id)
        .single();

      if (error || !admin) {
        return res.status(401).json({ message: 'Not authorized as an admin' });
      }

      req.user = decoded; // { id, iat, exp }
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect, optionalAuth, requirePaid, protectAdmin };
