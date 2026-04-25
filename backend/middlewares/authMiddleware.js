const jwt = require('jsonwebtoken');
const { supabase } = require('../db');

// ─────────────────────────────────────────────────────────────
//  protect — verifies JWT, attaches req.user = { id }
// ─────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// ─────────────────────────────────────────────────────────────
//  requirePaid — must run AFTER protect
//  Checks is_paid = true AND last_paid_date within 3 months.
//  If subscription has expired it auto-flips is_paid → false
//  in the DB before returning 403.
// ─────────────────────────────────────────────────────────────
const requirePaid = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('user_applications')
      .select('is_paid, last_paid_date')
      .eq('user_id', req.user.id)
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

      if (new Date() > expiryDate) {
        // Subscription expired — auto-flip is_paid to false
        await supabase
          .from('user_applications')
          .update({ is_paid: false, updated_at: new Date().toISOString() })
          .eq('user_id', req.user.id);

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

module.exports = { protect, requirePaid };
