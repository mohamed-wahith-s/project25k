import React from 'react';
import { Shield, Star, Zap, Sparkles } from 'lucide-react';

const Benefit = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">{icon}</div>
    <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default function BenefitsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16 border-t border-slate-100">
      <Benefit icon={<Shield className="text-primary-600" />} title="Secure Payments" desc="Bank-grade encryption for all your transactions." />
      <Benefit icon={<Star className="text-amber-500" />} title="Verified Colleges" desc="All institutional data is manually verified for accuracy." />
      <Benefit icon={<Zap className="text-indigo-600" />} title="Instant Access" desc="Unlock all features instantly after your subscription." />
      <Benefit icon={<Sparkles className="text-teal-500" />} title="Ad-Free Experience" desc="Zero distractions while you focus on your education." />
    </div>
  );
}
