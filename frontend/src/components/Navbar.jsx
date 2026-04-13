import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { LogOut, User, Search, Home, Star, GraduationCap, Youtube, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-indigo-200 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <GraduationCap size={26} className="drop-shadow-md" />
          </div>
          <div className="flex flex-col -space-y-1.5">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
              College Diaries
            </span>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 tracking-tight">
              Path<span className="text-indigo-600">Finder</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} />
          <NavLink to="/search" icon={<Search size={18} />} label="Colleges" active={isActive('/search')} />
          {isSubscribed && (
            <NavLink to="/tnea" icon={<GraduationCap size={18} />} label="TNEA Hub" active={isActive('/tnea')} />
          )}
          {!isSubscribed && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link to="/subscribe" className="flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 border border-blue-400">
                <Star size={14} fill="white" />
                <span>Activate Pro Axis</span>
              </Link>
            </motion.div>
          )}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-slate-900">{user.studentName || user.name || 'User'}</span>
            <span className={`text-[10px] uppercase tracking-wider font-black ${isSubscribed ? 'text-blue-600' : 'text-slate-500'}`}>
              {isSubscribed ? 'Pro Member' : 'Normal User'}
            </span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <User size={20} />
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 ml-2">
            <motion.a 
              href="https://www.youtube.com/@collegediaries9022" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center" 
              title="YouTube Channel"
            >
              <Youtube size={20} strokeWidth={2.5} />
            </motion.a>
            <motion.a 
              href="https://instagram.com/collegediaries1100?igsh=Z3J6dWhpZmdzZDl4" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-center" 
              title="Instagram Profile"
            >
              <Instagram size={20} strokeWidth={2.5} />
            </motion.a>
          </div>

          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-2 text-sm font-semibold transition-all ${active ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}
  >
    <span className={`${active ? 'text-primary-600' : 'text-slate-400'}`}>{icon}</span>
    <span>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 h-0.5 bg-primary-600 mt-8"
        style={{ width: '40px' }}
      />
    )}
  </Link>
);

export default Navbar;
