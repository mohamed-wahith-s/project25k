import React from 'react';
import { School, MapPin } from 'lucide-react';

export default function CollegeRowHeader({ college, isOpen, onViewDetails, onHideDetails }) {
  const deptCount = Array.isArray(college?.departments) ? college.departments.length : 0;
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-white gap-4">
      <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 border border-slate-100">
          <School size={24} className="sm:hidden" />
          <School size={28} className="hidden sm:block" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{college.name}</h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-100">Inst code: {college.code}</span>
            <span className="flex items-center text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-100"><MapPin size={10} className="mr-1.5 text-blue-500 sm:hidden" /><MapPin size={12} className="mr-1.5 text-blue-500 hidden sm:block" />{college.location}</span>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-100">
              Depts: {deptCount}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
        {isOpen ? (
          <button
            onClick={onHideDetails}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-center"
          >
            Hide
          </button>
        ) : (
          <button
            onClick={onViewDetails}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 text-center"
          >
            View Detail
          </button>
        )}
      </div>
    </div>
  );
}
