import React from 'react';
import { MapPin, Building, CheckCircle2 } from 'lucide-react';

const TNEAResultRow = ({ college, dept, communities, selectedCommunities, onClick }) => {
  const isPersonalized = selectedCommunities.length === 1;
  const userCaste = selectedCommunities[0];
  const cutoffValue = dept.cutoffs[userCaste] || '-';
  const isFree = college.isFree;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-100 rounded-xl px-6 py-4 grid items-center gap-4 hover:shadow-md transition-all duration-300 group cursor-pointer ${
        isPersonalized ? 'grid-cols-[1.5fr_1.5fr_150px]' : 'grid-cols-[1.5fr_1.5fr_repeat(7,60px)]'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors relative">
          <Building size={16} />
          {isFree && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white">
              FREE
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-1 uppercase group-hover:text-blue-600 transition-colors">{college.name}</span>
          <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-tight flex items-center gap-1.5"><MapPin size={10} />{college.location} ({college.id})</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-slate-800 uppercase leading-snug tracking-tight">{dept.branchName}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dept.code}</span>
      </div>

      {isPersonalized ? (
        <div className="flex justify-center">
          <button className="premium-gradient text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200">
            View More
          </button>
        </div>
      ) : (
        <div className="contents">
          {communities.map(comm => (
            <div key={comm} className={`text-[13px] font-bold text-center ${selectedCommunities.includes(comm) ? 'text-blue-600' : 'text-slate-700'}`}>
              {dept.cutoffs[comm] || '-'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TNEAResultRow;
