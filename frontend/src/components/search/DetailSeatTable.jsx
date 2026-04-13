import React from 'react';
import { Award } from 'lucide-react';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

export default function DetailSeatTable({ item }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-100">
      <div className="grid grid-cols-3 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
        <div className="text-left">Category</div>
        <div>Available Seats</div>
        <div className="text-right">Cutoff Score</div>
      </div>
      <div className="divide-y divide-slate-50">
        {communities.map(c => {
          // Support both free (topColleges) and pro (tneaData) data formats
          const seatInfo = item.dept.seats?.[c];
          const cutoffFromCutoffs = item.dept.cutoffs?.[c];
          
          // For free data: seats come from casteSeats[c].seats, cutoff from casteSeats[c].cutoff
          // For pro data: cutoffs come from dept.cutoffs[c], seats from dept.seats[c]
          const seatCount = seatInfo?.seats || seatInfo || "—";
          const cutoffValue = seatInfo?.cutoff 
            ? String(seatInfo.cutoff).replace("TNEA ≥ ", "") 
            : cutoffFromCutoffs || "-";

          return (
            <div key={c} className="grid grid-cols-3 px-8 py-6 items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-left">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center border border-indigo-100 uppercase">{c}</span>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{c} Category</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-primary-600">{typeof seatCount === 'object' ? '—' : seatCount}</span>
                <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Seats</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 text-[13px] font-black">
                  <Award size={12} /> {cutoffValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
