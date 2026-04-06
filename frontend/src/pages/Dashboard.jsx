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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center space-x-3 text-primary-600 mb-2">
            <Sparkles size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Premium Student Portal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-slate-500 mt-2 font-medium">Your personalized admission strategy is ready.</p>
        </motion.div>
        <Badge variant="premium" className="px-6 py-3 text-md bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-transparent shadow-xl">
          PRO MEMBER
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <AcademicProfileCard user={user} onEdit={() => setIsEditing(true)} />
        <SocialProfileCard user={user} />
        <ExpertSupportCard navigate={navigate} />
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight text-center">Exclusive Student Hub (பிரத்யேக மாணவர் தளம்)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Search className="text-primary-600" />} 
          title="College Search" 
          description="Find Engineering colleges based on your TNEA cutoffs and category." 
          onClick={() => navigate('/search')}
        />
        <FeatureCard 
          icon={<Compass className="text-indigo-600" />} 
          title="TNEA Hub" 
          description="Personalized path-finding for Tamil Nadu Engineering Admissions." 
          onClick={() => navigate('/tnea')}
        />
        <FeatureCard 
          icon={<Star className="text-amber-500" />} 
          title="Scholarship Radar" 
          description="Direct alerts for private and government scholarships." 
          onClick={() => navigate('/subscribe')}
        />
      </div>

      {isEditing && (
        <EditProfileModal 
          editForm={editForm} 
          handleEditChange={handleEditChange} 
          handleUpdateProfile={handleUpdateProfile} 
          isSaving={isSaving} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </div>
  );
};

const AcademicProfileCard = ({ user, onEdit }) => (
  <Card className="h-full border-slate-100 shadow-xl relative group p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center">
        <GraduationCap className="mr-2 text-primary-600" size={20} /> Academic Profile
      </h3>
      <button onClick={onEdit} className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
        <Edit2 size={14} className="mr-1.5" /> Edit
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <StatItem label="Marks" value={`${user?.marks || 0}%`} />
      <StatItem label="TNEA Cutoff" value={user?.cutoff || 0} primary />
    </div>
  </Card>
);

const StatItem = ({ label, value, primary }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className={`text-2xl font-black ${primary ? 'text-primary-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

const SocialProfileCard = ({ user }) => (
  <Card className="h-full border-slate-100 shadow-xl p-6">
    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
      <Shield className="mr-2 text-indigo-600" size={20} /> Reservation Benefits
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-slate-50 p-4 rounded-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
        <p className="text-xl font-black text-slate-900">{user?.caste || 'OC'}</p>
      </div>
    </div>
  </Card>
);

const ExpertSupportCard = ({ navigate }) => (
  <Card className="h-full bg-slate-900 text-white p-8">
    <h3 className="text-lg font-bold mb-4 flex items-center">
      <MessageCircle className="mr-2" size={20} /> Expert Support
    </h3>
    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Connect with senior counselors for personal guidance on TNEA 2025.</p>
    <Button variant="secondary" className="w-full text-slate-900 font-bold bg-white" onClick={() => navigate('/search')}>Contact Counselor</Button>
  </Card>
);

const FeatureCard = ({ icon, title, description, onClick }) => (
  <Card onClick={onClick} className="p-8 hover:shadow-2xl transition-all border-slate-100 bg-white h-full group cursor-pointer">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 font-medium">{description}</p>
    <div className="mt-6 flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors">Learn More <ArrowRight size={14} /></div>
  </Card>
);

const EditProfileModal = ({ editForm, handleEditChange, handleUpdateProfile, isSaving, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
      </div>
      <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="12th Marks (%)" name="marks" type="number" value={editForm.marks} onChange={handleEditChange} />
          <Input label="TNEA Cutoff" name="cutoff" type="number" value={editForm.cutoff} onChange={handleEditChange} />
        </div>
        <div className="flex justify-end gap-4"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" className="bg-slate-900 text-white px-6">Save</Button></div>
      </form>
    </motion.div>
  </div>
);

export default Dashboard;
