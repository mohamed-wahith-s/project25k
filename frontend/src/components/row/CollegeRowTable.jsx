import React from 'react';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

export default function CollegeRowTable({ filteredDepartments, selectedCommunity }) {
  return (
    <div className="p-4 sm:p-6 pt-2">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-6 py-4">Course Branch</th>
              <th className="px-4 py-4 text-center">Code</th>
              {communities.map(comm => (
                <th key={comm} className={`px-4 py-4 text-center transition-colors ${selectedCommunity === comm ? 'text-blue-600 bg-blue-50/50 rounded-t-xl' : ''}`}>
                  {comm}
                </th>
              ))}
              <th className="px-6 py-4 text-right">Seats</th>
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
                <td className="px-4 py-5 border-y border-slate-100 text-center font-mono text-xs font-bold text-slate-500">{dept.code}</td>
                {communities.map(comm => (
                  <td key={comm} className={`px-4 py-5 border-y border-slate-100 text-center transition-colors ${selectedCommunity === comm ? 'bg-blue-50/20 border-x-blue-100' : ''}`}>
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-black transition-colors ${selectedCommunity === comm ? 'text-blue-700' : 'text-slate-900'}`}>
                        {dept?.cutoffs?.[comm] ?? '-'}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        Rank: {dept?.ranks?.[comm] ?? '-'}
                      </span>
                    </div>
                  </td>
                ))}
                <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="text-xs font-black text-slate-900">{dept?.seatsFilling?.[selectedCommunity] ?? '—'}</span>
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

      {/* Mobile Card View */}
      <div className="lg:hidden flex flex-col gap-4">
        {filteredDepartments.map((dept, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <span className="font-black text-slate-900 text-sm leading-tight">{dept.branchName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code: {dept.code}</span>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {selectedCommunity}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cutoff</span>
                <span className="text-lg font-black text-slate-900">{dept?.cutoffs?.[selectedCommunity] ?? '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</span>
                <span className="text-lg font-black text-slate-900">{dept?.ranks?.[selectedCommunity] ?? '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Seats Available</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">{dept?.seatsFilling?.[selectedCommunity] ?? '-'}</span>
                  <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
