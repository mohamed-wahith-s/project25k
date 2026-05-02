import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, Calendar, BookOpen,
  Trophy, Lock, Crown, Save, Loader, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useApiBase } from '../context/ApiContext';

const CASTE_OPTIONS = ['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST'];

// ─────────────────────────────────────────────────────────────────────────────
// SettingsModal — right-side drawer with editable profile fields
//   • All users  → Basic Info (name, email, mobile, DOB)
//   • Pro users  → + Academic Info (physics, chemistry, maths, rank, caste)
// ─────────────────────────────────────────────────────────────────────────────
const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { isSubscribed } = useSubscription();
  const API_BASE = useApiBase();

  const emptyForm = {
    studentName: '', email: '', phone: '', dob: '',
    physics_mark: '', chemistry_mark: '', maths_mark: '',
    tnea_ranking: '', caste: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync form values when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        studentName:    user.studentName   || user.name        || '',
        email:          user.email                             || '',
        phone:          user.phone                             || '',
        dob:            user.dob                               || '',
        physics_mark:   user.physics_mark  != null ? String(user.physics_mark)   : '',
        chemistry_mark: user.chemistry_mark != null ? String(user.chemistry_mark) : '',
        maths_mark:     user.maths_mark    != null ? String(user.maths_mark)     : '',
        tnea_ranking:   user.tnea_ranking  != null ? String(user.tnea_ranking)   : '',
        caste:          user.caste                             || '',
      });
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!form.studentName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const url  = `${API_BASE}/auth/profile`;

      // Always send basic info
      const metadata = {
        studentName: form.studentName.trim(),
        email:       form.email.trim(),
        phone:       form.phone.trim(),
        dob:         form.dob || undefined,
      };

      // Only include academic fields for Pro users
      if (isSubscribed) {
        if (form.physics_mark   !== '') metadata.physics_mark   = form.physics_mark;
        if (form.chemistry_mark !== '') metadata.chemistry_mark = form.chemistry_mark;
        if (form.maths_mark     !== '') metadata.maths_mark     = form.maths_mark;
        if (form.tnea_ranking   !== '') metadata.tnea_ranking   = form.tnea_ranking;
        if (form.caste)                 metadata.caste          = form.caste;
      }

      const res  = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ metadata }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed.');

      updateUser(data);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.studentName || user?.name || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* ── Drawer ── */}
          <motion.div
            key="settings-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900">Profile Settings</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isSubscribed ? 'Pro — all fields editable' : 'Free — basic info only'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-7">

                {/* ── User avatar card ── */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-md flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 truncate">{user?.studentName || user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <span className={`inline-flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${isSubscribed ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                      {isSubscribed ? <><Crown size={9} /><span>Pro Member</span></> : <span>Free Plan</span>}
                    </span>
                  </div>
                </div>

                {/* ── Section 1: Basic Info ── */}
                <section>
                  <SectionHeader title="Basic Info" subtitle="Available to all users" />
                  <div className="space-y-4">
                    <Field
                      icon={<User size={14} className="text-indigo-400" />}
                      label="Full Name"
                      name="studentName"
                      value={form.studentName}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                    <Field
                      icon={<Mail size={14} className="text-indigo-400" />}
                      label="Email Address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    <Field
                      icon={<Phone size={14} className="text-indigo-400" />}
                      label="Mobile Number"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                    />
                    <Field
                      icon={<Calendar size={14} className="text-indigo-400" />}
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                {/* ── Section 2: Academic Details ── */}
                <section>
                  <SectionHeader
                    title="Academic Details"
                    subtitle={isSubscribed ? 'Editable with Pro plan' : 'Upgrade to Pro to edit'}
                    badge={!isSubscribed && (
                      <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        <Lock size={9} />
                        <span>Pro Only</span>
                      </span>
                    )}
                  />

                  {isSubscribed ? (
                    <div className="space-y-4">
                      {/* Marks */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Physics', name: 'physics_mark' },
                          { label: 'Chemistry', name: 'chemistry_mark' },
                          { label: 'Maths', name: 'maths_mark' },
                        ].map(({ label, name }) => (
                          <div key={name}>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {label}
                            </label>
                            <input
                              type="number"
                              name={name}
                              min="0"
                              max="100"
                              step="0.5"
                              value={form[name]}
                              onChange={handleChange}
                              placeholder="—"
                              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-700 text-center font-bold"
                            />
                          </div>
                        ))}
                      </div>

                      <Field
                        icon={<Trophy size={14} className="text-amber-500" />}
                        label="TNEA Rank"
                        name="tnea_ranking"
                        type="number"
                        min="1"
                        value={form.tnea_ranking}
                        onChange={handleChange}
                        placeholder="e.g. 12500"
                      />

                      {/* Caste dropdown */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-[10px]">🎓</span>
                          <span>Caste Category</span>
                        </label>
                        <select
                          name="caste"
                          value={form.caste}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-slate-700 appearance-none"
                        >
                          <option value="">Select category…</option>
                          {CASTE_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* ── Locked state for free users ── */
                    <div className="relative rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                        <Lock size={20} className="text-amber-500" />
                      </div>
                      <p className="text-sm font-black text-slate-800 mb-1">
                        Academic Details Locked
                      </p>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Physics, Chemistry, Maths marks, TNEA rank and Caste category are only editable for <strong>Pro Members</strong>.
                      </p>
                      <Link
                        to="/subscribe"
                        onClick={onClose}
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
                      >
                        <Crown size={13} />
                        <span>Upgrade to Pro — <span className="line-through opacity-70 mr-1">₹499</span>₹199</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0 space-y-3 bg-white">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-red-500 font-medium text-center"
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-emerald-600 font-bold text-center"
                  >
                    ✅ Settings saved successfully!
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="settings-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <><Loader size={14} className="animate-spin" /><span>Saving…</span></>
                  ) : (
                    <><Save size={14} /><span>Save Changes</span></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Sub-components ── */

const SectionHeader = ({ title, subtitle, badge }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-300 font-medium mt-0.5">{subtitle}</p>}
    </div>
    {badge}
  </div>
);

const Field = ({ icon, label, name, value, onChange, type = 'text', placeholder, ...rest }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center space-x-1.5">
      <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <span>{label}</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-700 placeholder:text-slate-300 transition-shadow"
      {...rest}
    />
  </div>
);

export default SettingsModal;
