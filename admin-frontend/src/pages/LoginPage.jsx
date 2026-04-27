import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { useApi } from '../context/ApiContext';

const LoginPage = () => {
  const { api } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/admin/login', { email, password });
      if (data.success) {
        login(data.token, data.admin);
        navigate('/dashboard/users');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-primary flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full bg-white" />
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none">College Diaries</p>
              <p className="text-white/70 text-xs font-medium leading-none mt-0.5">by Path Finder</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Admin Control<br />Centre
            </h1>
            <p className="text-white/70 mt-4 text-base font-medium max-w-xs leading-relaxed">
              Manage student applications, college data, and counselling workflows from one secure place.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-3">
          {['Secure JWT authentication', 'Real-time data management', 'Role-based access control'].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="text-white/80 text-sm font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-text-primary font-extrabold text-sm leading-none">College Diaries</p>
              <p className="text-text-secondary text-xs font-medium leading-none mt-0.5">by Path Finder</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Welcome back
            </h2>
            <p className="text-text-secondary mt-1.5 text-sm font-medium">
              Sign in to your admin account to continue.
            </p>
          </div>

          {/* Error Alert */}
          <AnimateError error={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="admin-email"
                  required
                  autoComplete="email"
                  className="pl-10 pr-4 block w-full rounded-xl border border-border bg-background text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all duration-200 py-3 text-sm font-medium"
                  placeholder="admin@collegediaries.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-11 block w-full rounded-xl border border-border bg-background text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-white transition-all duration-200 py-3 text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-text-secondary mt-8 font-medium">
            This is a restricted admin portal. Unauthorized access is prohibited.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Animated error message
const AnimateError = ({ error }) => (
  <motion.div
    initial={false}
    animate={error ? { height: 'auto', opacity: 1, marginBottom: 20 } : { height: 0, opacity: 0, marginBottom: 0 }}
    transition={{ duration: 0.2 }}
    className="overflow-hidden"
  >
    {error && (
      <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-2">
        <span className="flex-shrink-0 mt-0.5">⚠️</span>
        <span>{error}</span>
      </div>
    )}
  </motion.div>
);

export default LoginPage;
