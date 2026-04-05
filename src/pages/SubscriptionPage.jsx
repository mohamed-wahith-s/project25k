import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { Button, Card, Badge, Input } from '../components/ui';
import { Check, Star, Zap, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionPage = () => {
  const { subscribe, isSubscribed } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [metadata, setMetadata] = useState({
    marks: '',
    cutoff: '',
    counselingRank: '',
    caste: '',
    religion: ''
  });
  const navigate = useNavigate();

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    setShowMetadataForm(true);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!metadata.marks || !metadata.cutoff || !metadata.counselingRank || !metadata.caste || !metadata.religion) {
      alert('Please fill in all details to proceed.');
      return;
    }
    
    setLoadingPlan(selectedPlanId);
    try {
      await subscribe(selectedPlanId, metadata);
      navigate('/search');
    } finally {
      setLoadingPlan(null);
      setShowMetadataForm(false);
    }
  };

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Sprint',
      price: '$9.90',
      period: 'per week',
      description: 'Perfect for quick admissions and last-minute applications.',
      features: ['Full College Database', '2 Expert Consultations', 'Scholarship Matches'],
      variant: 'secondary'
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: '$29.90',
      period: 'per month',
      description: 'Our most popular plan for serious students seeking the best.',
      features: [
        'Everything in Weekly',
        'Unlimited Consultations',
        'Direct Admission Routes',
        'AI Application Assistant'
      ],
      recommended: true,
      variant: 'premium'
    },
    {
      id: 'yearly',
      name: 'Annual Pass',
      price: '$199.90',
      period: 'per year',
      description: 'Comprehensive 4-year plan for career and college guidance.',
      features: [
        'Everything in Monthly',
        'Gap Year Counseling',
        'Internship Placements',
        'Lifetime Alumni Network'
      ],
      variant: 'secondary'
    }
  ];

  if (showMetadataForm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-2xl shadow-primary-200/20 p-10 border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">One Last Step</h2>
              <p className="text-slate-500 mt-2">Help us personalize your counseling experience</p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="12th Standard Marks (%)"
                  name="marks"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 95.5"
                  value={metadata.marks}
                  onChange={handleMetadataChange}
                  required
                />

                <Input
                  label="TNEA Cutoff (out of 200)"
                  name="cutoff"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 192.5"
                  value={metadata.cutoff}
                  onChange={handleMetadataChange}
                  required
                />

                <Input
                  label="TNEA Counseling Rank"
                  name="counselingRank"
                  type="number"
                  placeholder="e.g. 12450"
                  value={metadata.counselingRank}
                  onChange={handleMetadataChange}
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Caste / Category</label>
                  <select 
                    name="caste"
                    value={metadata.caste}
                    onChange={handleMetadataChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium"
                    required
                  >
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
                  <select 
                    name="religion"
                    value={metadata.religion}
                    onChange={handleMetadataChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium"
                    required
                  >
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <Button 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={() => setShowMetadataForm(false)}
                  disabled={loadingPlan}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="premium" 
                  className="flex-[2]"
                  isLoading={!!loadingPlan}
                >
                  Confirm & Subscribe
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check size={48} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">You're All Set!</h1>
          <p className="text-xl text-slate-500 mb-10">You have active Pro access. Enjoy exploring colleges.</p>
          <Button size="lg" onClick={() => navigate('/search')}>
            Start Searching
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
        >
          <Sparkles size={16} />
          <span>UPGRADE YOUR FUTURE</span>
        </motion.div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Unlock Your College Journey
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Get exclusive access to detailed cutoffs, counselor advice, and 
          priority placement in top-tier universities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`h-full flex flex-col relative transition-all duration-500 hover:shadow-2xl ${plan.recommended ? 'border-primary-500 border-2 shadow-primary-100 shadow-2xl scale-105 z-10' : 'hover:-translate-y-2'}`}
              noPadding
            >
              {plan.recommended && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  RECOMMENDED BY EXPERTS
                </div>
              )}
              
              <div className="p-8 pb-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="ml-1.5 text-slate-500 font-medium">{plan.period}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 p-8 pt-0 space-y-4">
                <div className="h-px bg-slate-100 w-full mb-6"></div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="p-8 pt-0">
                <Button
                  variant={plan.variant}
                  className="w-full py-4 text-lg font-bold"
                  size="xl"
                  isLoading={loadingPlan === plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.recommended ? 'Subscribe Now' : 'Choose Plan'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16 border-t border-slate-100">
        <Benefit icon={<Shield className="text-primary-600" />} title="Secure Payments" desc="Bank-grade encryption for all your transactions." />
        <Benefit icon={<Star className="text-amber-500" />} title="Verified Colleges" desc="All institutional data is manually verified for accuracy." />
        <Benefit icon={<Zap className="text-indigo-600" />} title="Instant Access" desc="Unlock all features instantly after your subscription." />
        <Benefit icon={<Sparkles className="text-teal-500" />} title="Ad-Free Experience" desc="Zero distractions while you focus on your education." />
      </div>
    </div>
  );
};

const Benefit = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
      {icon}
    </div>
    <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default SubscriptionPage;
