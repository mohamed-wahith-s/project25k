import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Button, Input, Card } from '../components/ui';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      // Supabase automatically parses the #access_token from the URL hash 
      // and creates a temporary session.
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found in ResetPassword. Link might be expired or invalid.");
        setError("Invalid or expired reset link. Please request a new one from the forgot password page.");
      }
      setIsVerifying(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode active');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <Card className="p-8 shadow-2xl shadow-indigo-100 border-emerald-100">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset!</h2>
            <p className="text-slate-500 mb-8">
              Your password has been updated successfully. You will be redirected to the login page shortly.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login Now
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 mt-2 text-sm">Create a new secure password for your account</p>
        </div>

        <Card className="shadow-2xl shadow-slate-200/50 p-6">
          {error && !isVerifying && !password && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-3">
                <AlertCircle className="text-red-500" size={24} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/forgot-password')}
                  className="mt-2"
                >
                  Request New Link
                </Button>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* New Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                  required
                  disabled={!!error && !password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11"
                  required
                  disabled={!!error && !password}
                />
              </div>
            </div>

            {error && password && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              size="lg"
              disabled={!!error && !password}
            >
              Update Password
            </Button>
            
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors pt-2"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

