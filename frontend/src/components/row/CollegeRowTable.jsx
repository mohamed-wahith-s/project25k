import React from 'react';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

export default function CollegeRowTable({ filteredDepartments, selectedCommunity }) {
  return (
    <div className="p-6 pt-2 overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <th className="px-6 py-4">Course Branch</th><th className="px-4 py-4 text-center">Code</th>
            {communities.map(comm => <th key={comm} className={`px-4 py-4 text-center transition-colors ${selectedCommunity === comm ? 'text-blue-600 bg-blue-50/50 rounded-t-xl' : ''}`}>{comm}</th>)}
            <th className="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept, idx) => (
            <tr key={idx} className="group/row bg-white hover:shadow-md transition-all duration-300">
              <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-100"><div className="flex flex-col"><span className="font-black text-slate-900 text-sm tracking-tight">{dept.branchName}</span><span className="text-[10px] font-bold text-slate-400 mt-0.5">Professional Engineering Degree</span></div></td>
              <td className="px-4 py-5 border-y border-slate-100 text-center font-mono text-xs font-bold text-slate-500">{dept.code}</td>
              {communities.map(comm => (
                <td key={comm} className={`px-4 py-5 border-y border-slate-100 text-center transition-colors ${selectedCommunity === comm ? 'bg-blue-50/20 border-x-blue-100' : ''}`}>
                  <div className="flex flex-col items-center"><span className={`text-sm font-black transition-colors ${selectedCommunity === comm ? 'text-blue-700' : 'text-slate-900'}`}>{dept.cutoffs[comm] || '-'}</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Rank: {dept.ranks[comm] || '-'}</span></div>
                </td>
              ))}
              <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 text-right"><div className="inline-flex flex-col items-end"><span className="text-xs font-black text-slate-900">{dept.seats[selectedCommunity] || '0/0'}</span><div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-blue-500 w-full" /></div></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
