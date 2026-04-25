const Razorpay = require('razorpay');
const crypto = require('crypto');
const { supabase } = require('../db');

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/payment/create-order
//  @access  Protected (JWT)
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount provided.' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error?.error?.description || error.message);
    return res.status(500).json({
      message: 'Error creating Razorpay order.',
      error: error?.error?.description || error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/payment/verify
//  @access  Protected (JWT)
//
//  Responsibility: ONLY verify Razorpay signature and flip
//  is_paid = true in the DB. Nothing else. Metadata (marks,
//  rank, caste etc.) is saved separately via PUT /api/auth/profile.
// ─────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing Razorpay payment fields.' });
  }

  try {
    // 1. Verify HMAC signature
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // 2. Flip is_paid = true and record payment date
    const now = new Date().toISOString();
    const { data: updatedUser, error } = await supabase
      .from('user_applications')
      .update({
        is_paid: true,
        last_paid_date: now,
        updated_at: now,
      })
      .eq('user_id', req.user.id)
      .select('user_id, full_name, email, mobile_number, tnea_ranking, is_paid, last_paid_date')
      .single();

    if (error) throw error;
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    // 3. Calculate expiry date for the response (3 months from now)
    const expiryDate = new Date(updatedUser.last_paid_date);
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    return res.json({
      success: true,
      message: 'Payment verified. Subscription activated for 3 months.',
      user: {
        id: updatedUser.user_id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.mobile_number,
        studentName: updatedUser.full_name,
        tnea_ranking: updatedUser.tnea_ranking,
        isSubscribed: true,
        subscriptionExpiry: expiryDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    return res.status(500).json({ message: 'Error verifying payment.' });
  }
};

module.exports = { createOrder, verifyPayment };
