import React from 'react';
import { MapPin, Building, CheckCircle2, ChevronsUpDown } from 'lucide-react';

const TNEAResultRow = ({ college, onClick }) => {
  return (
    <div 
      className="bg-white border-b border-slate-100 px-6 py-3 grid grid-cols-[80px_2.5fr_1fr_120px] items-center gap-6 hover:bg-slate-50/50 transition-all duration-200 group cursor-default"
    >
      {/* College Code Column */}
      <div className="flex justify-center">
        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-tight border border-slate-200 group-hover:bg-white transition-colors">
          {college.college_code || college.code || 'N/A'}
        </span>
      </div>

      {/* Institution Details Column */}
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-bold text-slate-900 leading-tight uppercase truncate group-hover:text-indigo-600 transition-colors">
          {college.name || college.college_name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin size={10} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
            {college.location || college.college_address}
          </span>
        </div>
      </div>
      
      {/* Availability Column */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-black text-indigo-500 uppercase leading-tight tracking-tight bg-indigo-50 px-3 py-1 rounded-full">
          {college.branchCount || 0} Courses
        </span>
      </div>

      {/* Action Column */}
      <div className="flex justify-end">
        <button 
          onClick={onClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
        >
          View More
          <ChevronsUpDown size={12} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default TNEAResultRow;
