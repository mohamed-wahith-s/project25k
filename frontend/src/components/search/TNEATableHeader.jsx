import React from 'react';
import { ChevronsUpDown } from 'lucide-react';

const HeaderItem = ({ label, align = "center" }) => (
  <div className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors group ${align === "start" ? "justify-start" : "justify-center"}`}>
    <span>{label}</span>
    <ChevronsUpDown size={10} className="group-hover:text-indigo-500" />
  </div>
);

export default function TNEATableHeader({ communities }) {
  const isPersonalized = communities.length === 1;
  return (
    <div 
      className={`px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest items-center grid gap-4 ${
        isPersonalized ? 'grid-cols-[1.5fr_1.5fr_150px]' : `grid-cols-[1.5fr_1.5fr_repeat(${communities.length},60px)]`
      }`}
    >
      <HeaderItem label="Institution" align="start" />
      <HeaderItem label="Branch Detail" align="start" />
      {communities.map(comm => <HeaderItem key={comm} label={comm} align="center" />)}
    </div>
  );
}
