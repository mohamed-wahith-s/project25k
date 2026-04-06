const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  subscriptionMetadata: {
    marks: String,
    cutoff: String,
    counselingRank: String,
    caste: String,
    religion: String,
    address: String,
    dateOfBirth: String,
    alternatePhone: String
  },
  subscriptionPlan: { type: String },
  paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
