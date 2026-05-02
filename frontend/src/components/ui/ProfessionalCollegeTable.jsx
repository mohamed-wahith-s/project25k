import React from 'react';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

export default function ProfessionalCollegeTable({ college, rawRows = [], userCaste = null }) {
  // Determine which communities to show. 
  // If userCaste is provided (and valid), only show that one.
  const displayCommunities = (userCaste && communities.includes(userCaste)) 
    ? [userCaste] 
    : communities;

  const colSpanHeader = displayCommunities.length + 4;

  // 1. Group rows by department
  const byDept = {};
  rawRows.forEach(row => {
    const key = row.dept_id ?? row.subject_code ?? row.departments?.dept_name;
    if (!key) return;
    
    if (!byDept[key]) {
      byDept[key] = {
        branchName: row.departments?.dept_name || row.subject_code || 'Unknown',
        code: row.departments?.subject_code || row.subject_code || '—',
        cutoffs: {},
        ranks: {},
        seatsFilling: {},
        totalSeats: null,
      };
    }
    
    const caste = row.caste_category;
    if (communities.includes(caste)) {
      if (row.cutoff_mark != null) byDept[key].cutoffs[caste] = row.cutoff_mark;
      if (row.rank != null) byDept[key].ranks[caste] = row.rank;
      if (row.seats_filling != null) byDept[key].seatsFilling[caste] = row.seats_filling;
      if (row.total_seats_in_dept != null && !byDept[key].totalSeats) {
        byDept[key].totalSeats = row.total_seats_in_dept;
      }
    }
  });

  const departments = Object.values(byDept).sort((a, b) => 
    a.branchName.localeCompare(b.branchName)
  );

  // Calculate totals
  let overallSeatsFilling = 0;
  let overallTotalSeats = 0;

  departments.forEach(dept => {
    let deptSeatsFilling = 0;
    // We sum over all communities for the total, or just displayed ones? 
    // Usually "TOTAL SEATS FILLING" implies the sum of all categories in that dept.
    communities.forEach(c => {
      const sf = dept.seatsFilling[c];
      if (sf) {
        const numStr = sf.toString().split('/')[0];
        const num = parseInt(numStr, 10);
        if (!isNaN(num)) deptSeatsFilling += num;
      }
    });
    overallSeatsFilling += deptSeatsFilling;
    if (dept.totalSeats) {
      overallTotalSeats += parseInt(dept.totalSeats, 10) || 0;
    }
  });

  const collegeName = college?.name || college?.college_name || 'COLLEGE';
  const collegeCode = college?.code || college?.college_code || '';
  const collegeAddress = college?.location || college?.college_address || '';

  // Current year for the header
  const currentYear = new Date().getFullYear();

  if (departments.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
        No data matching the selected filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white p-4">
      <table className="w-full min-w-[800px] border-collapse border border-black font-sans text-xs">
        <thead>
          <tr>
            <th colSpan={colSpanHeader} className="bg-[#1e1b4b] text-white text-center py-4 px-6 font-black uppercase border border-slate-300 text-sm tracking-wider">
              {collegeName}{collegeAddress ? `, ${collegeAddress}` : ''}
              <div className="text-indigo-300 text-[10px] mt-1 font-bold">
                CLOSING CUTOFF - {currentYear} • COLLEGE CODE: {collegeCode}
              </div>
            </th>
          </tr>
          <tr className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest">
            <th className="border border-slate-300 px-2 py-3 text-center w-12">SN</th>
            <th className="border border-slate-300 px-2 py-3 text-center w-24">CODE</th>
            <th className="border border-slate-300 px-4 py-3 text-left">DEPARTMENT / BRANCH</th>
            {displayCommunities.map(c => (
              <th key={c} className="border border-slate-300 px-2 py-3 text-center w-16">{c}</th>
            ))}
            <th className="border border-slate-300 px-2 py-3 text-center w-28">TOTAL SEATS</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, index) => {
            // Count total seats for this specific dept from string sf if totalSeats is null
            let computedDeptTotal = 0;
            let computedDeptFilling = 0;
            communities.forEach(c => {
               const sf = dept.seatsFilling[c];
               if(sf) {
                 const parts = sf.toString().split('/');
                 if(parts.length > 0) computedDeptFilling += parseInt(parts[0], 10) || 0;
                 if(parts.length > 1) computedDeptTotal += parseInt(parts[1], 10) || 0;
               }
            });
            const displayTotalSeats = dept.totalSeats ? `${computedDeptFilling}/${dept.totalSeats}` : (computedDeptTotal > 0 ? `${computedDeptFilling}/${computedDeptTotal}` : '-');

            return (
              <React.Fragment key={dept.code || index}>
                {/* Row 1: Cutoff */}
                <tr className="bg-white text-slate-900">
                  <td className="border border-slate-300 px-2 py-2 text-center font-black bg-slate-50" rowSpan={3}>{index + 1}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center font-black bg-[#1e1b4b] text-white" rowSpan={3}>{dept.code}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-left uppercase font-bold text-[11px] tracking-tight bg-slate-50/50">{dept.branchName}</td>
                  {displayCommunities.map(c => (
                    <td key={c} className="border border-slate-300 px-2 py-2 text-center font-bold text-[11px]">{dept.cutoffs[c] || '—'}</td>
                  ))}
                  <td className="border border-slate-300 px-2 py-2 text-center font-black text-[11px] bg-slate-50" rowSpan={3}>{displayTotalSeats}</td>
                </tr>
                {/* Row 2: Rank */}
                <tr className="bg-[#fffbeb] text-amber-900/80">
                  <td className="border border-slate-300 px-4 py-1.5 text-left font-black text-[9px] uppercase tracking-widest italic opacity-70">CLOSING RANK</td>
                  {displayCommunities.map(c => (
                    <td key={c} className="border border-slate-300 px-2 py-1.5 text-center font-medium text-[10px]">{dept.ranks[c] || '—'}</td>
                  ))}
                </tr>
                {/* Row 3: Seats Filling */}
                <tr className="bg-[#eff6ff] text-blue-900/80">
                  <td className="border border-slate-300 px-4 py-1.5 text-left font-black text-[9px] uppercase tracking-widest italic opacity-70">SEATS FILLED</td>
                  {displayCommunities.map(c => (
                    <td key={c} className="border border-slate-300 px-2 py-1.5 text-center font-medium text-[10px]">{dept.seatsFilling[c] || '0'}</td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 text-slate-800">
            <td colSpan={colSpanHeader - 1} className="border border-slate-300 text-right pr-6 font-black py-3 uppercase tracking-widest text-[10px]">TOTAL SEATS FILLED ACROSS ALL CATEGORIES</td>
            <td className="border border-slate-300 text-center font-black py-3 text-xs">{overallSeatsFilling}/{overallTotalSeats > 0 ? overallTotalSeats : '-'}</td>
          </tr>
          <tr className="bg-[#1e1b4b] text-white/80">
            <td colSpan={colSpanHeader} className="border border-slate-300 text-center font-black py-3 uppercase tracking-[0.4em] text-[9px]">
              PATHFINDER BY COLLEGE DIARIES
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
