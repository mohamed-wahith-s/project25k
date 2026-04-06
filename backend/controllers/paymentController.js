const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Create Order
const createOrder = async (req, res) => {
  const { planId, amount, metadata } = req.body;
  
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // We can temporarily save plan info or metadata if needed, but usually we just send order to client
    res.json({
      success: true,
      order,
      planId,
      metadata,
      key_id: process.env.RAZORPAY_KEY_ID // Send to frontend for checkout initialization
    });
  } catch (error) {
    console.log("🔥 FULL ERROR OBJECT:", error);
    console.log("🔥 ERROR MESSAGE:", error.message);
    console.log("🔥 ERROR DESCRIPTION:", error?.error?.description);

    res.status(500).json({
      message: "Error creating order",
      error: error?.error?.description || error.message
    });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, metadata } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      
      // Update User based on req.user.id (from auth middleware)
      const user = await User.findById(req.user.id);
      if (user) {
        user.isSubscribed = true;
        user.subscriptionPlan = planId;
        user.subscriptionMetadata = metadata;
        user.paymentId = razorpay_payment_id;
        await user.save();

        res.json({ success: true, message: "Payment verified successfully", user });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

module.exports = { createOrder, verifyPayment };
