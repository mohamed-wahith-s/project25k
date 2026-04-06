import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

const CollegeRow = ({ college, selectedCommunity, userCutoff }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredDepartments = college.departments.filter(dept => {
    if (!userCutoff) return true;
    const communityCutoff = parseFloat(dept.cutoffs[selectedCommunity] || 0);
    return parseFloat(userCutoff) >= communityCutoff;
  });

  if (filteredDepartments.length === 0 && userCutoff) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden group">
      {/* Primary Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-6 cursor-pointer bg-white"
      >
        <div className="flex items-center gap-6 flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isExpanded ? 'bg-slate-900 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
          }`}>
            <School size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 group-hover:text-blue-600 transition-colors">
              {college.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                Inst code: {college.code}
              </span>
              <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <MapPin size={12} className="mr-1.5 text-blue-500" />
                {college.location}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entrance Cutoff</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 italic">≥</span>
              <span className="text-3xl font-black text-blue-600 tabular-nums">{college.minCutoff}</span>
            </div>
          </div>
          <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300'}`}>
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </div>

      {/* Nested Table (Expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#FCFDFF] border-t border-slate-50"
          >
            <div className="p-6 pt-2 overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Course Branch</th>
                    <th className="px-4 py-4 text-center">Code</th>
                    {communities.map(comm => (
                      <th 
                        key={comm}
                        className={`px-4 py-4 text-center transition-colors ${
                          selectedCommunity === comm ? 'text-blue-600 bg-blue-50/50 rounded-t-xl' : ''
                        }`}
                      >
                        {comm}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept, idx) => (
                    <tr key={idx} className="group/row bg-white hover:shadow-md transition-all duration-300">
                      <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm tracking-tight">{dept.branchName}</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">Professional Engineering Degree</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 border-y border-slate-100 text-center font-mono text-xs font-bold text-slate-500">
                        {dept.code}
                      </td>
                      {communities.map(comm => (
                        <td 
                          key={comm} 
                          className={`px-4 py-5 border-y border-slate-100 text-center transition-colors ${
                            selectedCommunity === comm ? 'bg-blue-50/20 border-x-blue-100' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-black transition-colors ${
                              selectedCommunity === comm ? 'text-blue-700' : 'text-slate-900'
                            }`}>
                              {dept.cutoffs[comm] || '-'}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                              Rank: {dept.ranks[comm] || '-'}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-xs font-black text-slate-900">{dept.seats[selectedCommunity] || '0/0'}</span>
                          <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Focused</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seat Matrix Validated</span>
                </div>
              </div>
              <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                View Full College Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollegeRow;
