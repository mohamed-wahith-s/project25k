import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { User, Mail, Phone, Calculator, Shield, Award, Users, Calendar, MapPin, Sparkles, Save } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSubscription } from '../context/SubscriptionContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const { subscribe } = useSubscription();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    physics: user?.physics || '', chemistry: user?.chemistry || '', maths: user?.maths || '', caste: user?.caste || 'OC',
    tneaRank: user?.tneaRank || '', fatherName: user?.fatherName || '', dob: user?.dob || '', address: user?.address || ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    const studentCutoff = (parseFloat(formData.physics || 0) + parseFloat(formData.chemistry || 0)) / 2 + parseFloat(formData.maths || 0);
    subscribe({ ...formData, cutoff: studentCutoff });
    alert("Profile saved! Your directory is now personalized.");
    navigate('/search');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-20">
      <ProfileHeader />
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrimaryInfo formData={formData} handleChange={handleChange} />
          <PersonalLocation formData={formData} handleChange={handleChange} />
        </div>
        <AcademicScores formData={formData} handleChange={handleChange} />
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 text-lg">
            Complete Profile & Upgrade <Sparkles size={18} className="ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

const ProfileHeader = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-100">
      <Sparkles size={32} />
    </div>
    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Setup Your Pro Account</h1>
    <p className="text-slate-500 mt-2 font-medium">Please provide your academic details to unlock full consultancy features.</p>
  </motion.div>
);

const PrimaryInfo = ({ formData, handleChange }) => (
  <Card className="p-8 space-y-6">
    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2"><User size={18} className="text-blue-500" /> Primary Info</h3>
    <div className="space-y-4">
      <Input label="Full Name" name="studentName" value={formData.studentName} onChange={handleChange} />
      <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
      <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
      <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
    </div>
  </Card>
);

const PersonalLocation = ({ formData, handleChange }) => (
  <Card className="p-8 space-y-6">
    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2"><Calendar size={18} className="text-indigo-500" /> Details</h3>
    <div className="space-y-4">
      <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Caste Category</label>
        <select name="caste" value={formData.caste} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-700 font-medium">
          {["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700 block ml-1">Current Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-700 font-medium resize-none shadow-inner" />
      </div>
    </div>
  </Card>
);

const AcademicScores = ({ formData, handleChange }) => (
  <Card className="p-8">
    <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Calculator size={18} className="text-emerald-500" /> Academic Scores</h3><Badge variant="success" className="px-3 py-1 font-bold">Verified</Badge></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Input label="Physics" name="physics" type="number" value={formData.physics} onChange={handleChange} /><Input label="Chemistry" name="chemistry" type="number" value={formData.chemistry} onChange={handleChange} /><Input label="Mathematics" name="maths" type="number" value={formData.maths} onChange={handleChange} /></div>
    <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TNEA Cutoff</p>
        <p className="text-4xl font-black text-slate-900">{((parseFloat(formData.physics || 0) + parseFloat(formData.chemistry || 0)) / 2 + parseFloat(formData.maths || 0)).toFixed(2)}</p>
      </div>
      <div className="flex flex-col justify-center"><label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1 flex items-center gap-2"><Award size={16} className="text-amber-500" /> TNEA Rank (Optional)</label><Input name="tneaRank" value={formData.tneaRank} onChange={handleChange} /></div>
    </div>
  </Card>
);

export default ProfilePage;
