const Razorpay = require('razorpay');
const crypto = require('crypto');
const { supabase } = require('../db');

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/payment/create-order
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { planId, amount, metadata } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount provided.' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      planId,
      metadata,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('🔥 Create order error:', error?.error?.description || error.message);
    return res.status(500).json({
      message: 'Error creating Razorpay order.',
      error: error?.error?.description || error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
//  @route   POST /api/payment/verify
//  @access  Protected
// ─────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
    metadata,
  } = req.body;

  try {
    // 1. Verify Razorpay signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // 2. Build subscription update payload from metadata
    const updatePayload = {
      is_subscribed: true,
      subscription_plan: planId,
      payment_id: razorpay_payment_id,
      subscription_metadata: metadata || {},
      updated_at: new Date().toISOString(),
    };

    // Promote key academic fields from metadata to top-level columns
    if (metadata) {
      if (metadata.marks)          updatePayload.marks           = parseFloat(metadata.marks)         || null;
      if (metadata.cutoff)         updatePayload.cutoff          = parseFloat(metadata.cutoff)        || null;
      if (metadata.caste)          updatePayload.caste           = metadata.caste;
      if (metadata.religion)       updatePayload.religion        = metadata.religion;
      if (metadata.counselingRank) updatePayload.counseling_rank = parseInt(metadata.counselingRank)  || null;
      if (metadata.address)        updatePayload.address         = metadata.address;
      if (metadata.dateOfBirth)    updatePayload.date_of_birth   = metadata.dateOfBirth;
      if (metadata.alternatePhone) updatePayload.alternate_phone = metadata.alternatePhone;
    }

    // 3. Update user in Supabase
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.username,
        email: updatedUser.email,
        isSubscribed: updatedUser.is_subscribed,
        subscriptionPlan: updatedUser.subscription_plan,
        subscriptionMetadata: updatedUser.subscription_metadata,
        cutoff: updatedUser.cutoff,
        caste: updatedUser.caste,
        marks: updatedUser.marks,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    return res.status(500).json({ message: 'Error verifying payment.' });
  }
};

module.exports = { createOrder, verifyPayment };
