import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadRazorpayScript } from '../utils/razorpayUtils';
import BenefitsSection from '../components/subscription/BenefitsSection';
import PlanGrid from '../components/subscription/PlanGrid';
import MetadataForm from '../components/subscription/MetadataForm';

const plans = [
  { id: 'weekly', name: 'Weekly Sprint', price: '$9.90', period: 'per week', description: 'Perfect for quick admissions and last-minute applications.', features: ['Full College Database', '2 Expert Consultations', 'Scholarship Matches'], variant: 'secondary' },
  { id: 'monthly', name: 'Monthly Pro', price: '$29.90', period: 'per month', description: 'Our most popular plan for serious students seeking the best.', features: ['Everything in Weekly', 'Unlimited Consultations', 'Direct Admission Routes', 'AI Application Assistant'], recommended: true, variant: 'premium' },
  { id: 'yearly', name: 'Annual Pass', price: '$199.90', period: 'per year', description: 'Comprehensive 4-year plan for career and college guidance.', features: ['Everything in Monthly', 'Gap Year Counseling', 'Internship Placements', 'Lifetime Alumni Network'], variant: 'secondary' }
];

const SubscriptionPage = () => {
  const { subscribe, isSubscribed } = useSubscription();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanAmount, setSelectedPlanAmount] = useState(0);
  const [metadata, setMetadata] = useState({ marks: '', cutoff: '', counselingRank: '', caste: '', religion: '', address: '', dateOfBirth: '', alternatePhone: '' });
  const navigate = useNavigate();

  const handlePlanSelect = (id, price) => { setSelectedPlanId(id); setSelectedPlanAmount(Math.round(parseFloat(price.replace('$', '')) * 80)); setShowMetadataForm(true); };
  const handleMetadataChange = (e) => setMetadata({ ...metadata, [e.target.name]: e.target.value });

  const handleSubscribe = async (e) => {
    e.preventDefault(); if (!metadata.marks || !metadata.cutoff || !metadata.caste) return alert('Please fill required details.');
    setLoadingPlan(selectedPlanId);
    try {
      if (!await loadRazorpayScript()) return alert('Razorpay failed to load.');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const orderRes = await fetch(`${API_URL}/payment/create-order`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` }, body: JSON.stringify({ planId: selectedPlanId, amount: selectedPlanAmount, metadata }) });
      const orderData = await orderRes.json();
      const options = { key: orderData.key_id, amount: orderData.order.amount, currency: orderData.order.currency, name: 'College Diaries', order_id: orderData.order.id, prefill: { name: user.name, email: user.email }, theme: { color: '#4f46e5' },
        handler: async (res) => {
          const vRes = await fetch(`${API_URL}/payment/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` }, body: JSON.stringify({ razorpay_payment_id: res.razorpay_payment_id, razorpay_order_id: res.razorpay_order_id, razorpay_signature: res.razorpay_signature, planId: selectedPlanId, metadata }) });
          if (vRes.ok) { subscribe({ subscriptionPlan: selectedPlanId, subscriptionMetadata: metadata }); navigate('/search'); } else alert('Verification Failed!');
        }
      };
      new window.Razorpay(options).open();
    } catch (err) { alert(`Error: ${err.message}`); } finally { setLoadingPlan(null); setShowMetadataForm(false); }
  };

  if (showMetadataForm) return <MetadataForm metadata={metadata} handleMetadataChange={handleMetadataChange} handleSubscribe={handleSubscribe} setShowMetadataForm={setShowMetadataForm} loadingPlan={loadingPlan} />;
  if (isSubscribed) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"><div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8"><Check size={48} strokeWidth={3} /></div><h1 className="text-4xl font-bold text-slate-900 mb-4">You're All Set!</h1><Button size="lg" onClick={() => navigate('/search')}>Start Searching</Button></motion.div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16"><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"><Sparkles size={16} /><span>UPGRADE YOUR FUTURE</span></motion.div><h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Unlock Your College Journey</h1></div>
      <PlanGrid plans={plans} loadingPlan={loadingPlan} handlePlanSelect={handlePlanSelect} />
      <BenefitsSection />
    </div>
  );
};

export default SubscriptionPage;
