import React from 'react';
import { ArrowLeft, Building, MapPin, GraduationCap, Users, Zap } from 'lucide-react';
import DetailStatGrid from './DetailStatGrid';
import DetailSeatTable from './DetailSeatTable';

export default function CollegeDetailView({ item, onClose, onSubscribe }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
        </button>
        <div className="flex items-center gap-3"><Building size={16} className="text-slate-400" /><span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.id}</span></div>
      </div>
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3"><span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${item.isFree ? 'bg-primary-50 text-primary-600 border-primary-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{item.isFree ? 'Free Access' : 'Pro Access'}</span></div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{item.name}</h1>
            <p className="text-lg text-slate-500 font-medium flex items-center gap-2"><MapPin size={20} className="text-slate-300" /> {item.location}</p>
          </div>
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 shadow-xl shadow-slate-100"><Building size={32} /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10"><GraduationCap size={28} /></div>
                <div>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Course Detail</p>
                  <h3 className="text-2xl font-black tracking-tight">{item.dept.branchName}</h3>
                  <p className="text-white/40 text-xs font-bold mt-1 uppercase tracking-widest">Code: {item.dept.code}</p>
                </div>
              </div>
              <DetailStatGrid />
            </section>
            <section>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-6"><Users size={20} className="text-primary-600" /> Community-wise Breakdown</h3>
              <DetailSeatTable item={item} />
            </section>
          </div>
          <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary-100 h-fit">
            <Zap size={24} className="mb-4" />
            <h4 className="text-lg font-black mb-2">Want deeper insights?</h4>
            <p className="text-white/70 text-sm font-medium mb-6">Get round-wise cutoff predictions and personalized choice filling assistance.</p>
            <button onClick={onSubscribe} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-102 transition-transform">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
