import React from 'react';
import { School, MapPin, ChevronUp, ChevronDown } from 'lucide-react';

export default function CollegeRowHeader({ college, isExpanded, setIsExpanded }) {
  const deptCount = Array.isArray(college?.departments) ? college.departments.length : 0;
  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between p-6 cursor-pointer bg-white">
      <div className="flex items-center gap-6 flex-1">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
          <School size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 group-hover:text-blue-600 transition-colors">{college.name}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Inst code: {college.code}</span>
            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"><MapPin size={12} className="mr-1.5 text-blue-500" />{college.location}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              Depts: {deptCount}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entrance Cutoff</p>
          <div className="flex items-baseline gap-1"><span className="text-2xl font-black text-slate-900 italic">≥</span><span className="text-3xl font-black text-blue-600 tabular-nums">{college.minCutoff}</span></div>
        </div>
        <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300'}`}>{isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
      </div>
    </div>
  );
}
