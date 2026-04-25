import React from 'react';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

function CutoffCell({ cutoff, rank, isHighlighted }) {
  const hasCutoff = cutoff != null && cutoff !== '-' && cutoff !== '';
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-[56px] py-2 rounded-xl transition-all duration-200 ${isHighlighted ? 'bg-indigo-50/50' : 'group-hover/row:bg-slate-50/50'}`}>
      <div className="flex flex-col items-center gap-1">
        <span className={`text-[15px] font-bold tracking-tight leading-none ${
          hasCutoff 
            ? (isHighlighted ? 'text-indigo-700' : 'text-slate-800') 
            : 'text-slate-200'
        }`}>
          {hasCutoff ? cutoff : '—'}
        </span>
        
        {hasCutoff ? (
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none transition-colors ${
            isHighlighted 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'bg-slate-100 text-slate-500 group-hover/row:bg-slate-200'
          }`}>
            <span className="opacity-70">#</span>
            {rank || '—'}
          </div>
        ) : (
          <div className="h-[18px]" /> // Maintain height consistency
        )}
      </div>
    </div>
  );
}

export default function CollegeRowTable({ filteredDepartments, selectedCommunity }) {
  return (
    <div className="px-4 pb-6 pt-2 sm:px-6">
      {/* Table Legend */}
      <div className="flex items-center gap-5 mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-800">190</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cutoff Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center px-1.5 h-5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
            #1234
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State Rank</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-left">
                Engineering Branch
              </th>
              <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
                Code
              </th>
              {communities.map(comm => (
                <th
                  key={comm}
                  className={`px-2 py-4 text-[12px] font-black uppercase tracking-widest text-center transition-all duration-300 ${
                    selectedCommunity === comm
                      ? 'text-indigo-600 bg-indigo-50/50 rounded-t-xl border-t border-x border-indigo-100/50'
                      : 'text-slate-400'
                  }`}
                >
                  {comm}
                </th>
              ))}
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">
                Availability
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept, idx) => (
              <tr key={idx} className="group/row transition-all duration-200">
                {/* Branch Name */}
                <td className="px-6 py-5 rounded-l-2xl border border-r-0 border-slate-100 bg-white shadow-sm group-hover/row:border-indigo-100 group-hover/row:shadow-md transition-all">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-800 text-[14px] leading-tight group-hover/row:text-indigo-900 transition-colors">
                      {dept.branchName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        B.E / B.Tech
                      </span>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="px-3 py-5 border-y border-slate-100 bg-white shadow-sm group-hover/row:border-indigo-100 group-hover/row:shadow-md transition-all text-center">
                  <span className="inline-block text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg font-mono tracking-tighter">
                    {dept.code}
                  </span>
                </td>

                {/* Cutoff Cells */}
                {communities.map(comm => (
                  <td
                    key={comm}
                    className={`px-1 py-5 border-y border-slate-100 bg-white shadow-sm group-hover/row:border-indigo-100 group-hover/row:shadow-md transition-all text-center ${
                      selectedCommunity === comm ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <CutoffCell
                      cutoff={dept?.cutoffs?.[comm]}
                      rank={dept?.ranks?.[comm]}
                      isHighlighted={selectedCommunity === comm}
                    />
                  </td>
                ))}

                {/* Seats */}
                <td className="px-6 py-5 rounded-r-2xl border border-l-0 border-slate-100 bg-white shadow-sm group-hover/row:border-indigo-100 group-hover/row:shadow-md transition-all text-right">
                  <div className="inline-flex flex-col items-end gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-800">
                        {dept?.seatsFilling?.[selectedCommunity] ?? '0'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ 60</span>
                    </div>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (dept?.seatsFilling?.[selectedCommunity] || 0) > 40 ? 'bg-emerald-400' : 'bg-indigo-400'
                        }`} 
                        style={{ width: `${Math.min(((dept?.seatsFilling?.[selectedCommunity] || 0) / 60) * 100, 100)}%` }} 
                      />
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
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
            {/* Card Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-50 bg-slate-50/30">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-800 text-sm leading-tight">{dept.branchName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-white px-1.5 py-0.5 rounded border border-slate-100">B.E / B.Tech</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-100 px-2 py-1 rounded-md font-mono">{dept.code}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="grid grid-cols-3 gap-0 divide-x divide-slate-100 bg-white">
              <div className="flex flex-col items-center px-2 py-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Cutoff</span>
                <span className="text-lg font-black text-slate-800">{dept?.cutoffs?.[selectedCommunity] || '—'}</span>
              </div>
              <div className="flex flex-col items-center px-2 py-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">State Rank</span>
                <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-black">
                  <span className="opacity-60 text-[9px]">#</span>
                  {dept?.ranks?.[selectedCommunity] || '—'}
                </div>
              </div>
              <div className="flex flex-col items-center px-2 py-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Availability</span>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-lg font-black text-slate-800">{dept?.seatsFilling?.[selectedCommunity] ?? '0'}</span>
                  <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${Math.min(((dept?.seatsFilling?.[selectedCommunity] || 0) / 60) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selected Community Indicator */}
            <div className="px-5 py-2.5 bg-indigo-600 text-center">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                Viewing {selectedCommunity} Data
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

