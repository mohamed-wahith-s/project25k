import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Button, Card, Badge, Input } from '../components/ui';
import { Search, Compass, BookOpen, MessageCircle, Star, ArrowRight, Zap, GraduationCap, Shield, Sparkles, Edit2, X } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isSubscribed) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Premium Welcome */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-3 text-primary-600 mb-2">
              <Sparkles size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Premium Student Portal</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-lg text-slate-500 mt-2 font-medium">
              Your personalized admission strategy is ready.
            </p>
          </motion.div>
          
          <Badge variant="premium" className="px-6 py-3 text-md bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-transparent shadow-xl shadow-primary-200">
            PRO MEMBER
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Academic Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={120} />
              </div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <GraduationCap className="mr-2 text-primary-600" size={20} />
                  Academic Profile
                </h3>
                <button onClick={() => setIsEditing(true)} className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Edit2 size={14} className="mr-1.5" /> Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Standard Marks</p>
                  <p className="text-2xl font-black text-slate-900">{user?.subscriptionMetadata?.marks || user?.marks}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TNEA Cutoff</p>
                  <p className="text-2xl font-black text-primary-600">{user?.subscriptionMetadata?.cutoff || user?.cutoff}</p>
                </div>
                <div className="col-span-2 bg-primary-50 px-4 py-3 rounded-2xl mt-2">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Counseling Rank</p>
                  <p className="text-2xl font-black text-primary-700">#{user?.subscriptionMetadata?.counselingRank || user?.counselingRank || 'N/A'}</p>
                </div>
              </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-sm text-slate-500 leading-relaxed uppercase font-bold text-[10px] tracking-widest mb-1">Status</p>
                  <p className="text-slate-900 font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block text-xs">Eligibility: HIGH</p>
                </div>
            </Card>
          </motion.div>

          {/* Social Profile & Reservation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <Shield className="mr-2 text-indigo-600" size={20} />
                Reservation Benefits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-xl font-black text-slate-900">{user?.subscriptionMetadata?.caste || user?.caste}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Religion</p>
                  <p className="text-xl font-black text-slate-900">{user?.subscriptionMetadata?.religion || user?.religion}</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-500 leading-relaxed italic">
                * Your cutoff benefits are calculated based on {user?.subscriptionMetadata?.caste || user?.caste} category reservation rules.
              </p>
            </Card>
          </motion.div>

          {/* Expert Access */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full premium-gradient text-white p-8">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MessageCircle className="mr-2" size={20} />
                Expert Support
              </h3>
              <p className="text-primary-100 text-sm mb-8 leading-relaxed">
                Connect with our senior counselors today for personal guidance on TNEA 2024 admissions.
              </p>
              <Button variant="secondary" className="w-full text-primary-700 font-bold shadow-lg" onClick={() => navigate('/search')}>
                Contact Counselor
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Feature Grid for Premium */}
        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Your Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Search className="text-primary-600" />}
            title="Advanced College Filter"
            description="Access precise TNEA cutoff data for all 500+ engineering colleges."
            locked={false}
          />
          <FeatureCard 
            icon={<Compass className="text-indigo-600" />}
            title="Choice Filling Helper"
            description="Get AI-powered recommendations for your TNEA choice filling list."
            locked={false}
          />
          <FeatureCard 
            icon={<Star className="text-amber-500" />}
            title="Scholarship Radar"
            description="Direct alerts for private and government scholarships matching your profile."
            locked={false}
          />
        </div>
        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form id="profile-edit-form" onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="12th Standard Marks (%)" name="marks" type="number" step="0.01" value={editForm.marks} onChange={handleEditChange} required />
                    <Input label="TNEA Cutoff (out of 200)" name="cutoff" type="number" step="0.01" value={editForm.cutoff} onChange={handleEditChange} required />
                    <Input label="TNEA Counseling Rank (Optional)" name="counselingRank" type="number" value={editForm.counselingRank || ''} onChange={handleEditChange} />
                    <Input label="Date of Birth" name="dateOfBirth" type="date" value={editForm.dateOfBirth || ''} onChange={handleEditChange} required />
                    <div className="col-span-1 md:col-span-2">
                       <Input label="Full Address" name="address" type="text" value={editForm.address || ''} onChange={handleEditChange} required />
                    </div>
                    <Input label="Alternate Phone Number (Optional)" name="alternatePhone" type="tel" value={editForm.alternatePhone || ''} onChange={handleEditChange} />
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 ml-1">Caste / Category</label>
                      <select name="caste" value={editForm.caste} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" required>
                        <option value="">Select Category</option>
                        <option value="OC">OC</option>
                        <option value="BC">BC</option>
                        <option value="BCM">BCM</option>
                        <option value="MBC">MBC</option>
                        <option value="SC">SC</option>
                        <option value="SCA">SCA</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 ml-1">Religion</label>
                      <select name="religion" value={editForm.religion} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" required>
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" form="profile-edit-form" variant="premium" isLoading={isSaving}>Save Changes</Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <div className="flex items-center space-x-3 text-slate-500 mb-2">
          <span className="text-sm font-medium uppercase tracking-widest">Student Portal</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-sm font-medium">Over 500+ Colleges listed</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
          Hello, {user?.name}! 👋
        </h1>
        <p className="text-lg text-slate-500 mt-2">
          Ready to find your dream college? Start your search below.
        </p>
      </motion.div>

      {/* Main Action Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Card className="premium-gradient p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/10 transition-transform group-hover:scale-110 duration-500">
            <Compass size={200} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <Badge variant="premium" className="bg-white/20 text-white border-transparent mb-4">
              {isSubscribed ? "PRO FEATURES UNLOCKED" : "FREE PLAN"}
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Discover Top University Matches</h2>
            <p className="text-primary-100 text-lg mb-8">
              Analyze hundreds of colleges based on your scores, preferred courses, and location preferences.
            </p>
            <Button 
              variant="secondary"
              size="lg" 
              className="text-primary-700"
              onClick={() => navigate('/search')}
            >
              <Search className="mr-2" size={20} />
              Find Colleges Now
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <FeatureCard 
          icon={<BookOpen className="text-blue-500" />}
          title="Scholarship Guide"
          description="Access elite scholarship opportunities tailored to your profile."
          locked={!isSubscribed}
        />
        <FeatureCard 
          icon={<MessageCircle className="text-purple-500" />}
          title="Expert Counseling"
          description="Book a 1-on-1 session with our certified education experts."
          locked={!isSubscribed}
        />
        <FeatureCard 
          icon={<Zap className="text-amber-500" />}
          title="Instant Feedback"
          description="Get real-time feedback on your college application essays."
          locked={!isSubscribed}
        />
      </motion.div>

      {!isSubscribed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-xl shadow-amber-100">
            <Star size={40} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Unlock the Full PathFinder Experience</h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-lg">
            Get unlimited access to college search, personalized counseling, and direct admission routes.
          </p>
          <Button variant="premium" size="lg" onClick={() => navigate('/subscribe')}>
            View Premium Plans
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, locked }) => (
  <motion.div 
    variants={{
      hidden: { y: 20, opacity: 0 },
      show: { y: 0, opacity: 1 }
    }}
  >
    <Card className={`h-full group hover:shadow-xl transition-all duration-300 ${locked ? 'bg-slate-50/50 grayscale-[0.5]' : 'hover:-translate-y-2'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {locked && (
          <Badge variant="warning" className="flex items-center space-x-1">
            <span>🔒 Locked</span>
          </Badge>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
      {!locked && (
        <button className="mt-6 text-primary-600 font-bold flex items-center group/btn">
          Explore Features
          <ArrowRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </Card>
  </motion.div>
);

export default Dashboard;
