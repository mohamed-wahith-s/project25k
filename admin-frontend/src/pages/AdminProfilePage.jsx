import React, { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { motion } from 'framer-motion';
import { Mail, Shield, Calendar, LogOut } from 'lucide-react';

const AdminProfilePage = () => {
  const { admin, logout } = useContext(AdminAuthContext);

  if (!admin) return null;

  const initial = admin.full_name?.charAt(0)?.toUpperCase() || 'A';

  const infoItems = [
    { icon: Mail,     label: 'Email Address', value: admin.email },
    { icon: Shield,   label: 'Role',          value: admin.role || 'System Administrator' },
    ...(admin.created_at
      ? [{
          icon: Calendar,
          label: 'Member Since',
          value: new Date(admin.created_at).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
        }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-xl mx-auto px-0 space-y-5"
    >
      {/* Page title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
          Admin Profile
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-0.5">
          Your account information and session details.
        </p>
      </div>

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">

        {/* Gradient banner — tall enough so avatar never overlaps content below */}
        <div className="h-28 bg-gradient-to-r from-primary to-blue-500 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 left-8  w-28 h-28 rounded-full bg-white/10" />
        </div>

        {/* Avatar row — sits BELOW the banner, pulled up via negative margin.
            The parent has pt-0 so the avatar "peeks" into the banner zone. */}
        <div className="px-5 sm:px-8">
          {/* Avatar and Info Container */}
          <div className="-mt-10 mb-6 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 relative z-10">
            <div className="
              w-20 h-20 sm:w-24 sm:h-24
              bg-primary text-white rounded-2xl
              flex items-center justify-center
              text-3xl sm:text-4xl font-extrabold
              shadow-xl ring-4 ring-surface
              flex-shrink-0
            ">
              {initial}
            </div>

            <div className="flex-1 min-w-0 pb-1 sm:pb-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight truncate">
                {admin.full_name}
              </h2>
              <div className="mt-2 flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[11px] sm:text-xs font-bold rounded-full whitespace-nowrap">
                  <Shield size={12} className="flex-shrink-0" />
                  {admin.role || 'System Administrator'}
                </span>
              </div>
            </div>
          </div>

          {/* Info items */}
          <div className="pb-6 space-y-3">
            {infoItems.map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.15 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5 break-all leading-snug">
                    {value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Session card ─────────────────────────────────────── */}
      <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-text-primary mb-0.5">Active Session</h3>
          <p className="text-xs text-text-secondary font-medium leading-snug">
            Logged in as{' '}
            <span className="text-text-primary font-bold break-all">{admin.email}</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 active:scale-95 text-error border border-red-200 rounded-xl text-sm font-bold transition-all duration-150 flex-shrink-0 w-full sm:w-auto"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
};

export default AdminProfilePage;
