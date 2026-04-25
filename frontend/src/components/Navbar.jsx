import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  LogOut, User, Search, Home, Star, GraduationCap,
  Youtube, Instagram, Mail, Phone, Trophy, Pencil, Check, X,
  ChevronDown, Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBase, joinApi } from '../utils/apiBase';
import SettingsModal from './SettingsModal';

const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const { isSubscribed } = useSubscription();
  const location = useLocation();

  // Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // TNEA rank inline edit
  const [editingRank, setEditingRank] = useState(false);
  const [rankInput, setRankInput] = useState('');
  const [rankSaving, setRankSaving] = useState(false);
  const [rankError, setRankError] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setEditingRank(false);
        setRankError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const initials = (user.studentName || user.name || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleSaveRank = async () => {
    const rankNum = parseInt(rankInput, 10);
    if (!rankInput || isNaN(rankNum) || rankNum < 1) {
      setRankError('Enter a valid positive rank number.');
      return;
    }
    setRankSaving(true);
    setRankError('');
    try {
      const base = getApiBase();
      const url = joinApi(base, 'auth/profile/tnea-rank');
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ tnea_ranking: rankNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      updateUser({ ...data, tnea_ranking: data.tnea_ranking });
      setEditingRank(false);
      setRankInput('');
    } catch (err) {
      setRankError(err.message || 'Failed to save rank.');
    } finally {
      setRankSaving(false);
    }
  };

  const openSettings = () => {
    setDropdownOpen(false);
    setSettingsOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-[55] w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-indigo-200 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <GraduationCap size={26} className="drop-shadow-md" />
            </div>
            <div className="flex flex-col -space-y-1.5">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">College Diaries</span>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 tracking-tight">
                Path<span className="text-indigo-600">Finder</span>
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/"       icon={<Home size={18} />}   label="Home"    active={isActive('/')} />
            <NavLink to="/search" icon={<Search size={18} />} label="Colleges" active={isActive('/search')} />
            {!isSubscribed && (
              <motion.div
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link
                  to="/subscribe"
                  className="flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 border border-blue-400"
                >
                  <Star size={14} fill="white" />
                  <span>Activate Pro Axis</span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Social links */}
            <div className="hidden sm:flex items-center space-x-2 border-r border-slate-200 pr-4 mr-2">
              <motion.a
                href="https://www.youtube.com/@collegediaries9022"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                title="YouTube Channel"
              >
                <Youtube size={20} strokeWidth={2.5} />
              </motion.a>
              <motion.a
                href="https://instagram.com/collegediaries1100?igsh=Z3J6dWhpZmdzZDl4"
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -5 }} whileTap={{ scale: 0.9 }}
                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-center"
                title="Instagram Profile"
              >
                <Instagram size={20} strokeWidth={2.5} />
              </motion.a>
            </div>

            {/* ── Profile Avatar + Dropdown ── */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="navbar-profile-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-all"
                aria-label="Open profile"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {user.studentName || user.name || 'User'}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isSubscribed ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {isSubscribed ? 'Pro Member' : 'Free'}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Panel */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    {/* Gradient header */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black border-2 border-white/40">
                          {initials}
                        </div>
                        <div>
                          <p className="text-base font-black leading-tight">{user.studentName || user.name || 'User'}</p>
                          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 ${isSubscribed ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'}`}>
                            {isSubscribed ? '⭐ Pro Member' : 'Free Plan'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="p-4 space-y-3">
                      <InfoRow icon={<Mail size={15} className="text-indigo-500" />}  label="Email"  value={user.email  || '—'} />
                      <InfoRow icon={<Phone size={15} className="text-green-500" />} label="Mobile" value={user.phone  || '—'} />

                      {/* TNEA Rank */}
                      <div className="flex items-start space-x-3 py-2 border-t border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Trophy size={15} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">TNEA Rank</p>
                          {user.tnea_ranking ? (
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black text-amber-600 leading-none">
                                #{user.tnea_ranking.toLocaleString()}
                              </span>
                              <button
                                onClick={() => { setEditingRank(true); setRankInput(String(user.tnea_ranking)); }}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors"
                                title="Edit rank"
                              >
                                <Pencil size={13} />
                              </button>
                            </div>
                          ) : !editingRank ? (
                            <button
                              id="navbar-set-rank-btn"
                              onClick={() => setEditingRank(true)}
                              className="flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <Pencil size={13} />
                              <span>Set your TNEA rank</span>
                            </button>
                          ) : null}

                          {editingRank && (
                            <div className="mt-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  id="navbar-rank-input"
                                  type="number" min="1"
                                  value={rankInput}
                                  onChange={(e) => { setRankInput(e.target.value); setRankError(''); }}
                                  placeholder="e.g. 12500"
                                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRank(); if (e.key === 'Escape') { setEditingRank(false); setRankError(''); } }}
                                  autoFocus
                                />
                                <button onClick={handleSaveRank} disabled={rankSaving} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" title="Save">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => { setEditingRank(false); setRankError(''); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" title="Cancel">
                                  <X size={14} />
                                </button>
                              </div>
                              {rankError  && <p className="text-xs text-red-500 font-medium">{rankError}</p>}
                              {rankSaving && <p className="text-xs text-indigo-500 font-medium">Saving…</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-100 px-4 py-3 space-y-1">
                      {/* Settings */}
                      <button
                        id="navbar-settings-btn"
                        onClick={openSettings}
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                          <Settings size={14} className="text-indigo-500" />
                        </div>
                        <span>Settings</span>
                        <ChevronDown size={13} className="ml-auto -rotate-90 text-slate-300" />
                      </button>

                      {/* Logout */}
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                          <LogOut size={14} className="text-red-400" />
                        </div>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings drawer — rendered outside nav so it overlays everything */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

/* ── Sub-components ── */

const NavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 text-sm font-bold transition-all ${active ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
  >
    <span className={`${active ? 'text-indigo-600' : 'text-slate-400'}`}>{icon}</span>
    <span>{label}</span>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 h-0.5 bg-indigo-600 mt-8"
        style={{ width: '40px' }}
      />
    )}
  </Link>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default Navbar;
