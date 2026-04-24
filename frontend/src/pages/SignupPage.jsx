import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { User, Mail, Phone, Lock, UserPlus, GraduationCap, Eye, EyeOff, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    dob: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, phone, dob, password } = formData;
    
    if (!username || !email || !phone || !dob || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    try {
      await signup({
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dob,
        password: formData.password
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-200 mb-4 transition-transform hover:rotate-6">
            <GraduationCap size={32} />
          </div>
          <p className="text-primary-600 font-bold text-xs uppercase tracking-widest mb-1">
            College Diaries
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 text-sm">Join the PathFinder admissions portal</p>
        </div>

        <Card className="shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Username Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <User size={18} />
                </div>
                <Input
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-11"
                  autoFocus
                />
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11"
                />
              </div>

              {/* Phone Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Phone size={18} />
                </div>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-11"
                />
              </div>

              {/* Date of Birth Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <Input
                  name="dob"
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={handleChange}
                  className="pl-11 text-slate-500"
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center space-x-2"
              >
                <span>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              size="lg"
            >
              Sign Up
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-slate-900 hover:text-primary-600 transition-colors">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
