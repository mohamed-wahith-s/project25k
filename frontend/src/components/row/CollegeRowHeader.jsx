import React from 'react';
import { School, MapPin } from 'lucide-react';

export default function CollegeRowHeader({ college, isOpen, onViewDetails, onHideDetails }) {
  const deptCount = Array.isArray(college?.departments) ? college.departments.length : 0;
  return (
    <div className="flex items-center justify-between p-6 bg-white">
      <div className="flex items-center gap-6 flex-1">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100">
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
      <div className="flex items-center gap-6">
        {isOpen ? (
          <button
            onClick={onHideDetails}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Hide
          </button>
        ) : (
          <button
            onClick={onViewDetails}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
          >
            View Detail
          </button>
        )}
      </div>
    </div>
  );
}
