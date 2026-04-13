import React from 'react';
import { Search } from 'lucide-react';

export default function SearchHeader({ searchQuery, setSearchQuery }) {
  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 pr-6">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Course, city, college or code . . ."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-4 pl-16 pr-6 text-sm text-slate-600 outline-none font-bold placeholder:text-slate-300 bg-transparent"
        />
      </div>
    </div>
  );
}
