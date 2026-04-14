import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';

// ── Flat table: one row per (course × caste) entry ────────────────────────
// rawRows: the unmodified API rows for a single college
export default function BranchComparisonTable({ rawRows = [], departments = [] }) {

  const [expandedBranch, setExpandedBranch] = useState(0);

  // ----- Case A: we have raw rows (preferred — shows all DB data) ----------
  if (rawRows.length > 0) {
    // Group by dept
    const byDept = {};
    rawRows.forEach(row => {
      const key = row.dept_id ?? row.subject_code ?? row.departments?.dept_name;
      if (!byDept[key]) {
        byDept[key] = {
          branchName: row.departments?.dept_name || row.subject_code || 'Unknown',
          code: row.departments?.subject_code || row.subject_code || '—',
          rows: [],
        };
      }
      byDept[key].rows.push(row);
    });
    const branches = Object.values(byDept);

    return (
      <div className="w-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-100/50">
        {/* Table header */}
        <div className="grid grid-cols-[2.5fr_80px_140px_140px_110px_140px] px-6 py-4 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
          <span>Branch / Caste Category</span>
          <span className="text-center">Code</span>
          <span className="text-center">Cutoff Mark</span>
          <span className="text-center">Rank</span>
          <span className="text-center">Total Seats</span>
          <span className="text-center">Seats Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {branches.map((branch, bIdx) => (
            <div key={bIdx}>
              {/* Branch header row */}
              <button
                onClick={() => setExpandedBranch(expandedBranch === bIdx ? null : bIdx)}
                className="w-full grid grid-cols-[2.5fr_80px_140px_140px_110px_140px] px-6 py-4 bg-slate-50 hover:bg-indigo-50 transition-colors items-center text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform"></div>
                  <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-700 transition-colors">
                    {branch.branchName}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-md uppercase">
                    {branch.code}
                  </span>
                </div>
                <div className="text-center col-span-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {branch.rows.length} categories
                  </span>
                </div>
                <div className="flex justify-center">
                  {expandedBranch === bIdx
                    ? <ChevronUp size={16} className="text-indigo-500" />
                    : <ChevronDown size={16} className="text-slate-400" />
                  }
                </div>
              </button>

              {/* Caste rows — shown when expanded */}
              {(expandedBranch === bIdx) && branch.rows.map((row, rIdx) => {
                const caste   = row.caste_category || '—';
                const cutoff  = row.cutoff_mark  != null ? row.cutoff_mark  : '—';
                const rank    = row.rank          != null ? row.rank          : '—';
                const seats   = row.total_seats_in_dept ?? '—';
                const status  = row.seats_filling || '—';

                const statusColor =
                  status === 'FULL'         ? 'bg-red-50 text-red-600 border-red-100'
                : status === 'NEARLY FULL'  ? 'bg-amber-50 text-amber-600 border-amber-100'
                : status === 'PARTIAL'      ? 'bg-blue-50 text-blue-600 border-blue-100'
                : 'bg-slate-50 text-slate-400 border-slate-100';

                return (
                  <div
                    key={rIdx}
                    className="grid grid-cols-[2.5fr_80px_140px_140px_110px_140px] px-6 py-3.5 items-center bg-white hover:bg-slate-50 transition-colors border-t border-slate-50"
                  >
                    {/* Caste label */}
                    <div className="pl-8 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center border border-indigo-100 uppercase shrink-0">
                        {caste}
                      </span>
                      <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">
                        {caste} Category
                      </span>
                    </div>

                    {/* Code (blank for caste rows) */}
                    <div />

                    {/* Cutoff */}
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-[13px] font-black shadow-sm">
                        <Award size={11} className="opacity-70" />
                        {cutoff}
                      </span>
                    </div>

                    {/* Rank */}
                    <div className="text-center">
                      <span className="text-[13px] font-black text-slate-700">{rank}</span>
                    </div>

                    {/* Total Seats */}
                    <div className="text-center">
                      <span className="text-[14px] font-black text-indigo-600">{seats}</span>
                    </div>

                    {/* Seats Status */}
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Live Data from Supabase
          </p>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
            {branches.length} Courses · {rawRows.length} Entries
          </span>
        </div>
      </div>
    );
  }

  // ----- Case B: fallback to pivoted departments (legacy) ------------------
  if (departments.length === 0) return (
    <div className="py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
      No cutoff data available for this college.
    </div>
  );

  const allCastes = [...new Set(departments.flatMap(d => Object.keys(d.cutoffs || {})))];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-900">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-900 z-10 w-[260px]">Branch</th>
              <th className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Code</th>
              {allCastes.map(c => (
                <th key={c} className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center border-l border-slate-800">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((dept, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-[13px] font-black text-slate-900 uppercase">
                  {dept.branchName}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">{dept.code}</span>
                </td>
                {allCastes.map(c => {
                  const val = dept.cutoffs?.[c];
                  return (
                    <td key={c} className="px-4 py-4 text-center border-l border-slate-50">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[13px] font-black ${
                        val != null && val !== '-'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-white text-slate-300 border-slate-100'
                      }`}>
                        {val != null && val !== '-' && <Award size={11} />}
                        {val ?? '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{departments.length} Courses Found</span>
      </div>
    </div>
  );
}
