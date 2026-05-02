import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApiBase } from '../context/ApiContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { User, Calculator, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '../context/SubscriptionContext';

/* ──────────────────────────────────────────────────────────────
   Validation helper
   ────────────────────────────────────────────────────────────── */
const validate = (formData) => {
  const errors = {};

  if (!formData.studentName.trim())
    errors.studentName = 'Full name is required.';

  if (!formData.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }

  if (!formData.fatherName.trim())
    errors.fatherName = "Father's name is required.";

  if (!formData.dob)
    errors.dob = 'Date of birth is required.';

  const physics   = parseFloat(formData.physics);
  const chemistry = parseFloat(formData.chemistry);
  const maths     = parseFloat(formData.maths);

  if (formData.physics === '' || isNaN(physics))
    errors.physics = 'Physics mark is required.';
  else if (physics < 0 || physics > 100)
    errors.physics = 'Must be between 0 and 100.';

  if (formData.chemistry === '' || isNaN(chemistry))
    errors.chemistry = 'Chemistry mark is required.';
  else if (chemistry < 0 || chemistry > 100)
    errors.chemistry = 'Must be between 0 and 100.';

  if (formData.maths === '' || isNaN(maths))
    errors.maths = 'Mathematics mark is required.';
  else if (maths < 0 || maths > 100)
    errors.maths = 'Must be between 0 and 100.';

  return errors;
};

/* ──────────────────────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { user }    = useAuth();
  const API_URL     = useApiBase();
  const { subscribe } = useSubscription();
  const navigate    = useNavigate();

  const [formData, setFormData] = useState({
    studentName:  user?.studentName || user?.name || '',
    email:        user?.email        || '',
    phone:        user?.phone        || '',
    physics:      user?.physics      || '',
    chemistry:    user?.chemistry    || '',
    maths:        user?.maths        || '',
    caste:        user?.caste        || 'OC',
    tneaRank:     user?.tneaRank     || '',
    fatherName:   user?.fatherName   || '',
    dob:          user?.dob          || '',
    address:      user?.address      || '',
  });

  const [errors,         setErrors]         = useState({});
  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear inline error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // ── Validate first ──────────────────────────────────────────
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Auto-scroll to the first invalid field
      const firstField = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return; // ← STOP — do not open Razorpay
    }

    // ── All fields valid → proceed to payment ───────────────────
    setLoadingPayment(true);
    try {
      const { loadRazorpayScript } = await import('../utils/razorpayUtils');
      if (!await loadRazorpayScript()) {
        alert('Razorpay failed to load. Please try again.');
        return;
      }

      const studentCutoff =
        (parseFloat(formData.physics) + parseFloat(formData.chemistry)) / 2 +
        parseFloat(formData.maths);
      const metadata = { ...formData, cutoff: studentCutoff };

      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ planId: 'premium', amount: 199, metadata }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order');

      const options = {
        key:      orderData.key_id,
        amount:   orderData.order.amount,
        currency: orderData.order.currency,
        name:     'PathFinder Premium',
        order_id: orderData.order.id,
        prefill:  { name: user.studentName || user.name, email: user.email },
        theme:    { color: '#4f46e5' },
        handler: async (res) => {
          const vRes = await fetch(`${API_URL}/payment/verify`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body:    JSON.stringify({
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_order_id:   res.razorpay_order_id,
              razorpay_signature:  res.razorpay_signature,
              planId: 'premium',
              metadata,
            }),
          });
          if (vRes.ok) {
            subscribe({ ...formData, cutoff: studentCutoff });
            alert('Payment successful! Profile saved and Premium activated.');
            navigate('/search');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoadingPayment(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-100">
          <Sparkles size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Setup Your Pro Account</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Please provide your academic details to unlock full consultancy features.
        </p>
      </motion.div>

      <form onSubmit={handleSave} noValidate className="space-y-8">

        {/* ── Row 1: Primary Info + Personal Details ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Primary Info */}
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <User size={18} className="text-blue-500" /> Primary Info
            </h3>
            <div className="space-y-4">
              <Input
                label="Full Name *"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                error={errors.studentName}
                placeholder="e.g. Arjun Kumar"
              />
              <Input
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="e.g. arjun@email.com"
              />
              <Input
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="10-digit mobile number"
              />
              <Input
                label="Father's Name *"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                error={errors.fatherName}
                placeholder="e.g. Rajesh Kumar"
              />
            </div>
          </Card>

          {/* Personal / Location */}
          <Card className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-indigo-500" /> Details
            </h3>
            <div className="space-y-4">
              <Input
                label="Date of Birth *"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
              />
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">
                  Caste Category
                </label>
                <select
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-700 font-medium"
                >
                  {['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block ml-1">
                  Current Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-700 font-medium resize-none shadow-inner"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Row 2: Academic Scores ── */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator size={18} className="text-emerald-500" /> Academic Scores
            </h3>
            <Badge variant="success" className="px-3 py-1 font-bold">Verified</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Physics *"
              name="physics"
              type="number"
              min="0"
              max="100"
              value={formData.physics}
              onChange={handleChange}
              error={errors.physics}
              placeholder="0 – 100"
            />
            <Input
              label="Chemistry *"
              name="chemistry"
              type="number"
              min="0"
              max="100"
              value={formData.chemistry}
              onChange={handleChange}
              error={errors.chemistry}
              placeholder="0 – 100"
            />
            <Input
              label="Mathematics *"
              name="maths"
              type="number"
              min="0"
              max="100"
              value={formData.maths}
              onChange={handleChange}
              error={errors.maths}
              placeholder="0 – 100"
            />
          </div>
        </Card>

        {/* ── Error banner (shown after a failed submit attempt) ── */}
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
          >
            <span className="text-xl leading-none">⚠️</span>
            <div>
              <p className="text-sm font-black text-red-700">
                Please fill in all required fields before proceeding.
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                Fields marked with <span className="font-bold">*</span> are mandatory to activate Pro.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Button
            type="submit"
            isLoading={loadingPayment}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 text-lg"
          >
            Complete Profile &amp; Upgrade <Sparkles size={18} className="ml-2" />
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
