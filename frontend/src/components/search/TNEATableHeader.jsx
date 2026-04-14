import React from 'react';
import { ChevronsUpDown } from 'lucide-react';

const HeaderItem = ({ label, align = "center" }) => (
  <div className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors group ${align === "start" ? "justify-start" : "justify-center"}`}>
    <span>{label}</span>
    <ChevronsUpDown size={10} className="group-hover:text-indigo-500" />
  </div>
);

export default function TNEATableHeader() {
  return (
    <div className="w-full grid grid-cols-[80px_2.5fr_2fr_120px] px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left items-center bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-t-[1.5rem] mt-4">
      <span className="text-center">Code</span>
      <span>Institution Details</span>
      <span>Branch Detail</span>
      <span className="text-right pr-6">Action</span>
    </div>
  );
}
