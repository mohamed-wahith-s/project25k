import React from 'react';
import { ArrowLeft, Building, MapPin, GraduationCap, Users, Zap } from 'lucide-react';
import BranchComparisonTable from './BranchComparisonTable';

export default function CollegeDetailView({ item, onClose, onSubscribe }) {
  // rawRows = unmodified API rows for this college (passed from CollegeSearch/TNEADashboard)
  const rawRows     = item.rawRows     || [];
  const departments = item.departments || (item.dept ? [item.dept] : []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/80">
        <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">College Code</span>
             <span className="text-sm font-black text-slate-900 tracking-tight">{item.code || item.college_code}</span>
          </div>
          <div className="w-px h-8 bg-slate-100 mx-2"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Building size={20} /></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black px-3 py-1 bg-indigo-600 text-white rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">Official TNEA Data</span>
              {item.isFree && <span className="text-[10px] font-black px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full uppercase tracking-widest">Free Access</span>}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              {item.name || item.college_name}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-slate-500 font-bold bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <MapPin size={18} className="text-indigo-400" />
                <span className="text-sm uppercase tracking-tight">{item.location || item.college_address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <GraduationCap size={18} className="text-indigo-400" />
                <span className="text-sm uppercase tracking-tight">{departments.length} Courses Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <Users size={20} />
                  </div>
                  All Department Cutoffs
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 ml-13">Select a category to compare different branches</p>
              </div>
            </div>
            
            <BranchComparisonTable rawRows={rawRows} departments={departments} />
          </section>

          <footer className="pt-20 pb-10 border-t border-slate-200 text-center">
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Tamilnadu Engineering Admissions Directory ● 2024</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
