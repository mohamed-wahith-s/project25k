import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, CheckCircle2, RotateCcw } from 'lucide-react';
import { casteOptions } from '../../data/topColleges';

export default function WizardStepResult({ selectedCollege, selectedCourse, selectedCaste, resultData, reset }) {
  return (
    <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-1">Seat Availability</p>
            <h3 className="text-2xl font-black">{selectedCollege.name}</h3>
            <p className="text-primary-100 font-medium mt-0.5">{selectedCourse.name}</p>
          </div>
          <span className="bg-white/20 border border-white/30 text-white text-sm font-black px-4 py-2 rounded-xl">{selectedCaste} Category</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0"><Users size={28} className="text-primary-600" /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Available Seats</p>
            <p className="text-4xl font-black text-primary-700">{resultData.seats}</p>
            <p className="text-xs text-slate-500 mt-1">out of {selectedCourse.totalSeats} total</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><Award size={28} className="text-emerald-600" /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Min. Required Score</p>
            <p className="text-2xl font-black text-emerald-700 leading-tight">{resultData.cutoff}</p>
            <p className="text-xs text-slate-500 mt-1">for {selectedCaste} category</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2"><CheckCircle2 size={18} className="text-primary-500" /><span className="font-bold text-slate-900 text-sm">All Categories — Quick View</span></div>
        <div className="divide-y divide-slate-50">
          {casteOptions.map((caste, idx) => {
            const d = selectedCourse.casteSeats[caste];
            const isSelected = caste === selectedCaste;
            return (
              <div key={caste} className={`grid grid-cols-3 items-center px-5 py-3.5 ${isSelected ? 'bg-primary-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border w-fit ${isSelected ? 'bg-primary-600 text-white border-primary-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>{caste}{isSelected && ' ✓'}</span>
                <span className="text-center font-bold text-slate-700 text-sm">{d?.seats ?? '—'}<span className="text-slate-400 font-normal text-xs ml-1">seats</span></span>
                <span className="text-right"><span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{d?.cutoff ?? '—'}</span></span>
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={reset} className="mt-6 w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-primary-300 hover:text-primary-600 transition-all"><RotateCcw size={15} className="inline mr-2" />Check another college</button>
    </motion.div>
  );
}
