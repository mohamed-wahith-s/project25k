import React from 'react';
import { MapPin, Building, CheckCircle2 } from 'lucide-react';

const TNEAResultRow = ({ college, dept, communities, selectedCommunities, onClick }) => {
  const isMultiColumn = communities.length > 1;
  const userCaste = selectedCommunities[0] || "OC";
  const cutoffValue = dept.cutoffs[userCaste] || '-';
  const isFree = college.isFree;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-100 rounded-xl px-6 py-4 grid items-center gap-4 hover:shadow-md transition-all duration-300 group cursor-pointer ${
        isMultiColumn ? `grid-cols-[1.5fr_1.5fr_repeat(${communities.length},60px)]` : 'grid-cols-[1.5fr_1.5fr_150px]'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors relative">
          <Building size={16} />
          {isFree && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white">
              FREE
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-slate-900 leading-snug line-clamp-1 uppercase group-hover:text-indigo-600 transition-colors">{college.name}</span>
          <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight flex items-center gap-1"><MapPin size={8} />{college.location}</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-900 uppercase leading-snug tracking-tight">{dept.branchName}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{dept.code}</span>
      </div>

      {!isMultiColumn ? (
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{userCaste} Cutoff</span>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 text-[13px] font-black tabular-nums">
            {cutoffValue}
          </span>
        </div>
      ) : (
        <>
          {communities.map(comm => (
            <div key={comm} className={`text-[12px] font-black text-center tabular-nums ${selectedCommunities.includes(comm) ? 'text-indigo-600' : 'text-slate-600'}`}>
              {dept.cutoffs[comm] || '-'}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TNEAResultRow;
