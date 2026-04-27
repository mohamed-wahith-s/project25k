import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, User, Building, Users, Menu, X, LayoutDashboard } from 'lucide-react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/dashboard/users', label: 'User Details', icon: Users },
  { to: '/dashboard/colleges', label: 'Colleges', icon: Building },
];

const Header = () => {
  const { admin, logout } = useContext(AdminAuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
    }`;

  return (
    <>
      <header className="bg-surface border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <LayoutDashboard size={20} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base text-text-primary tracking-tight leading-none">
                  College Diaries
                </span>
                <span className="text-[10px] font-medium text-text-secondary tracking-wide uppercase leading-none mt-0.5">
                  by Path Finder
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                  }`
                }
              >
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {admin?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="max-w-[120px] truncate">{admin?.full_name || 'Admin'}</span>
              </NavLink>

              <div className="w-px h-5 bg-border mx-1" />

              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-error hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-text-secondary hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-surface shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <LayoutDashboard size={16} className="text-white" />
                  </div>
                  <span className="font-extrabold text-sm text-text-primary">Menu</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Admin Info Card */}
              <div className="mx-4 mt-4 mb-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {admin?.full_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate">{admin?.full_name || 'Admin'}</p>
                    <p className="text-xs text-text-secondary truncate">{admin?.email || ''}</p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-4 mb-2">Navigation</p>
                {navLinks.map(({ to, label, icon: Icon }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                  >
                    <NavLink to={to} className={mobileNavLinkClass}>
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  </motion.div>
                ))}

                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-4 mt-4 mb-2">Account</p>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  <NavLink to="/dashboard/profile" className={mobileNavLinkClass}>
                    <User size={18} />
                    My Profile
                  </NavLink>
                </motion.div>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-error rounded-xl text-sm font-bold transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
