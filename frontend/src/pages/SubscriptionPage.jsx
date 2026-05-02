import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useApiBase } from '../context/ApiContext';
import { Check, Sparkles, Lock, LogIn, GraduationCap, Star, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadRazorpayScript } from '../utils/razorpayUtils';

const PLAN_AMOUNT = 199; // INR

const SubscriptionPage = () => {
  const { user, updateUser } = useAuth();
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  const API_URL = useApiBase();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Already subscribed ────────────────────────────────────
  if (isSubscribed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-emerald-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">You're Pro!</h1>
          {user?.subscriptionExpiry && (
            <p className="text-sm text-slate-500 mb-6 flex items-center justify-center space-x-1">
              <Clock size={14} />
              <span>
                Valid until{' '}
                <strong className="text-slate-700">
                  {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </strong>
              </span>
            </p>
          )}
          <button
            onClick={() => navigate('/search')}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
          >
            Start Searching Colleges →
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Guest: not logged in ──────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Plan preview (disabled) */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
          >
            <Sparkles size={16} />
            <span>UPGRADE YOUR FUTURE</span>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Unlock Your College Journey
          </h1>
          <p className="text-slate-500 text-base">
            Get full access to Round 2 &amp; 3 cutoff data, AI assistant &amp; more.
          </p>
        </div>

        {/* Plan card (preview) */}
        <div className="max-w-sm mx-auto mb-10">
          <div className="relative rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-xl shadow-indigo-100">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                Recommended
              </span>
            </div>
            <div className="text-center mb-6">
              <p className="text-slate-500 text-sm font-semibold mb-1">Premium Access</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold text-slate-300 line-through">₹499</span>
                <span className="text-5xl font-black text-slate-900">₹199</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">for 3 months</p>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-slate-700">
              {[
                'Full College Database',
                'Round 2 & 3 Cutoff Data',
                'AI Application Assistant',
                'Unlimited Consultations',
              ].map((f) => (
                <li key={f} className="flex items-center space-x-2">
                  <Check size={16} className="text-indigo-500 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Lock overlay */}
            <div className="relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <Lock size={22} className="text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-500">Login to unlock</p>
              </div>
              <div className="opacity-30 pointer-events-none py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-center">
                Subscribe — ₹199
              </div>
            </div>
          </div>
        </div>

        {/* Login & Proceed CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-sm mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-300">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} />
            </div>
            <h2 className="text-xl font-black mb-2">Login &amp; Proceed</h2>
            <p className="text-indigo-100 text-sm mb-6">
              Sign in to your PathFinder account to complete your purchase and activate Pro.
            </p>
            <Link
              to="/login"
              state={{ from: '/subscribe' }}
              className="block w-full py-3 rounded-xl bg-white text-indigo-700 font-black text-sm hover:bg-indigo-50 transition-colors shadow-md"
            >
              Sign In →
            </Link>
            <p className="text-indigo-200 text-xs mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="underline text-white font-semibold">
                Sign up free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Logged in, not subscribed — show payment ──────────────
  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      if (!await loadRazorpayScript()) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // 1. Create order
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amount: PLAN_AMOUNT }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order.');

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'PathFinder Premium',
        description: 'Full access for 3 months',
        order_id: orderData.order.id,
        prefill: { name: user.studentName || user.name, email: user.email },
        theme: { color: '#4f46e5' },
        handler: async (rzpResponse) => {
          // 3. Verify payment — backend flips is_paid = true
          const vRes = await fetch(`${API_URL}/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_signature: rzpResponse.razorpay_signature,
            }),
          });
          const vData = await vRes.json();

          if (vRes.ok && vData.success) {
            // 4. Update frontend user state with is_paid info from DB
            updateUser(vData.user);
            navigate('/search');
          } else {
            setError(vData.message || 'Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
        >
          <Sparkles size={16} />
          <span>UPGRADE YOUR FUTURE</span>
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Unlock Your College Journey
        </h1>
        <p className="text-slate-500 text-base">
          One payment. Full access for 3 months.
        </p>
      </div>

      {/* Plan card */}
      <div className="max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border-2 border-indigo-300 bg-white p-8 shadow-2xl shadow-indigo-100"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center space-x-1">
              <Star size={10} fill="white" />
              <span>Most Popular</span>
            </span>
          </div>

          {/* Logged-in user greeting */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-indigo-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              {(user.studentName || user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{user.studentName || user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <ShieldCheck size={18} className="text-indigo-500 ml-auto flex-shrink-0" />
          </div>

          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm font-semibold mb-1">Premium Access</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-slate-300 line-through">₹499</span>
              <span className="text-5xl font-black text-slate-900">₹199</span>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center justify-center space-x-1">
              <Clock size={13} />
              <span>3-month access · auto-expires</span>
            </p>
          </div>

          <ul className="space-y-3 mb-8 text-sm text-slate-700">
            {[
              'Full College Cutoff Database',
              'Round 2 & 3 Cutoff Data',
              'AI Application Assistant',
              'Unlimited Consultations',
            ].map((f) => (
              <li key={f} className="flex items-center space-x-2">
                <Check size={16} className="text-indigo-500 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            id="subscribe-pay-btn"
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Opening payment…</span>
              </>
            ) : (
              <>
                <GraduationCap size={16} />
                <span>Pay ₹199 &amp; Activate Pro</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Secured by Razorpay · Subscription expires in 3 months
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
