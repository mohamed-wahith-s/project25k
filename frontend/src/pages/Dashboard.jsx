import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Button, Card, Badge, Input } from '../components/ui';
import { Search, Compass, BookOpen, ArrowRight, Zap, GraduationCap, Shield, Sparkles, Edit2, X, TrendingUp, Users, BarChart3, ChevronRight, MapPin, Star, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } });

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    marks: user?.subscriptionMetadata?.marks || user?.marks || '',
    cutoff: user?.subscriptionMetadata?.cutoff || user?.cutoff || '',
    counselingRank: user?.subscriptionMetadata?.counselingRank || user?.counselingRank || '',
    caste: user?.subscriptionMetadata?.caste || user?.caste || '',
    religion: user?.subscriptionMetadata?.religion || user?.religion || '',
    address: user?.subscriptionMetadata?.address || '',
    dateOfBirth: user?.subscriptionMetadata?.dateOfBirth || '',
    alternatePhone: user?.subscriptionMetadata?.alternatePhone || ''
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const config = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ metadata: editForm }),
      };

      const res = await fetch(`${API_URL}/auth/profile`, config);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Update failed');

      updateUser(data);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.2) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
          <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">Live Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
                Welcome back,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">{user?.studentName || user?.name || 'Student'}</span>
              </h1>
              <p className="text-slate-400 mt-3 text-lg font-medium max-w-lg">Your personalized admission strategy and counseling insights, all in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              {isSubscribed ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Pro Active</span>
                </div>
              ) : (
                <button onClick={() => navigate('/subscribe')} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm hover:from-amber-500/30 hover:to-orange-500/30 transition-all cursor-pointer">
                  <Star size={14} className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Upgrade to Pro</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Row - Floating Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 mb-12">
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<GraduationCap size={20} />} label="12th Marks" value={`${user?.marks || '—'}%`} color="blue" />
          {/* <StatCard icon={<Target size={20} />} label="TNEA Cutoff" value={user?.cutoff || '—'} color="indigo" /> */}
          <StatCard icon={<Shield size={20} />} label="Category" value={user?.caste || 'OC'} color="violet" />
          <StatCard icon={<TrendingUp size={20} />} label="Eligibility" value={parseFloat(user?.cutoff) >= 180 ? 'Strong' : 'Moderate'} color="emerald" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Actions Grid */}
        <motion.div {...fadeUp(0.2)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h2>
              <p className="text-sm text-slate-500 mt-1">Jump into your most-used tools</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all">
              <Edit2 size={14} />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            <ActionCard
              icon={<Search size={22} />}
              iconBg="bg-blue-50 text-blue-600"
              title="College Search"
              subtitle="கல்லூரி தேடல்"
              description="Explore 500+ Engineering, Medical & Arts colleges filtered by your TNEA cutoff and caste category."
              tag="Free Access"
              tagColor="bg-emerald-50 text-emerald-700 border-emerald-100"
              onClick={() => navigate('/search')}
            />
            {/* <ActionCard
              icon={<Compass size={22} />}
              iconBg="bg-indigo-50 text-indigo-600"
              title="TNEA Hub"
              subtitle="TNEA மையம்"
              description="AI-powered personalized pathfinding for Tamil Nadu Engineering Admissions with seat matrix analysis."
              tag={isSubscribed ? "Pro Unlocked" : "Pro Required"}
              tagColor={isSubscribed ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}
              onClick={() => isSubscribed ? navigate('/tnea') : navigate('/subscribe')}
            /> */}
          </div>
        </motion.div>

      </div>

      {isEditing && (
        <EditProfileModal 
          editForm={editForm} 
          handleEditChange={handleEditChange} 
          handleUpdateProfile={handleUpdateProfile} 
          isSaving={isSaving} 
          onClose={() => setIsEditing(false)} 
          isSubscribed={isSubscribed}
        />
      )}
    </div>
  );
};

/* ─── Sub Components ─── */

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-100 text-blue-600',
    indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-100 text-indigo-600',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-100 text-violet-600',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-100 text-emerald-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 backdrop-blur-xl shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="opacity-60">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
          <p className="text-2xl font-black text-slate-900 -mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, iconBg, title, subtitle, description, tag, tagColor, onClick }) => (
  <div onClick={onClick} className="group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
    <div className="relative">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>{icon}</div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${tagColor}`}>{tag}</span>
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-xs font-bold text-slate-400 mb-3">{subtitle}</p>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
        Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);



const EditProfileModal = ({ editForm, handleEditChange, handleUpdateProfile, isSaving, onClose, isSubscribed }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update your academic details</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"><X size={20} /></button>
      </div>
      <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="12th Marks (%)" name="marks" type="number" value={editForm.marks} onChange={handleEditChange} />
          {/* <div className="space-y-1 relative">
            <Input label="TNEA Cutoff" name="cutoff" type="number" value={editForm.cutoff} onChange={handleEditChange} disabled={isSubscribed} />
            {isSubscribed && <p className="text-[10px] text-amber-600 font-bold absolute -bottom-4 left-1">Locked for Pro Members</p>}
          </div> */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-slate-700 ml-1">Caste / Category</label>
            <select 
              name="caste" 
              value={editForm.caste} 
              onChange={handleEditChange} 
              disabled={isSubscribed}
              className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-700 font-medium ${isSubscribed ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
            >
              {["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {isSubscribed && <p className="text-[10px] text-amber-600 font-bold absolute -bottom-4 left-1">Locked for Pro Members</p>}
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3 mt-4">
          <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">For security and data accuracy, Pro members cannot change their Cutoff and Caste category once verified. Contact support if you need to correct these.</p>
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSaving} className="bg-slate-900 text-white px-8">Save Changes</Button>
        </div>
      </form>
    </motion.div>
  </div>
);

export default Dashboard;
