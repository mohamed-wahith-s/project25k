import React from 'react';
import { Filter, Tag, ChevronDown, Lock, CheckSquare } from 'lucide-react';
import { Button } from './ui';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

const SearchSidebar = ({ 
  selectedCommunities, 
  toggleCommunity, 
  department, 
  setDepartment, 
  resultsCount, 
  isSubscribed, 
  onUpgrade,
  hideCategory = false,
  dynamicDepartments = ["All"]
}) => {
  return (
    <aside className="w-[280px] bg-white border border-slate-200 rounded-3xl p-7 flex flex-col h-fit sticky top-24 shadow-sm">
      <div className="flex items-center gap-3 mb-8 font-black text-slate-900 text-xl tracking-tight">
        <Filter size={22} className="text-slate-900" />
        <h2>Filters</h2>
      </div>

      <div className="space-y-8 flex-1">
        {!hideCategory && (
          <section>
            <div className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-[0.15em] mb-4">
              <Tag size={16} className="text-slate-400 rotate-90" />
              <span>Category</span>
            </div>
            <div className="space-y-3 pl-1">
              {communities.map(comm => (
                <label key={comm} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedCommunities.includes(comm)}
                      onChange={() => toggleCommunity(comm)}
                      className="peer w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{comm}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-[0.15em] mb-4">
            <Tag size={16} className="text-slate-400 rotate-90" />
            <span>District</span>
          </div>
          <div className="relative group">
            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-xs font-black appearance-none outline-none focus:ring-2 focus:ring-indigo-50 transition-all pr-10 text-slate-600 cursor-pointer">
              <option>All</option>
              <option>Chennai</option>
              <option>Coimbatore</option>
              <option>Madurai</option>
              <option>Erode</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-[0.15em] mb-4">
            <Tag size={16} className="text-slate-400 rotate-90" />
            <span>Department</span>
          </div>
          <div className="relative group">
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-xs font-black appearance-none outline-none focus:ring-2 focus:ring-indigo-50 transition-all pr-10 text-slate-600 cursor-pointer"
            >
              {dynamicDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
          </div>
        </section>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
        <span className="text-slate-400 text-xs font-bold font-mono tracking-tight">{resultsCount} results</span>
      </div>
      
      {!isSubscribed && (
        <div className="mt-6 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 backdrop-blur-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Lock size={12} className="text-indigo-400" /> Free Mode
          </p>
          <p className="text-[11px] text-slate-500 font-bold leading-tight mb-4">Showing top 20 verified colleges. Upgrade for full TNEA database.</p>
          <Button size="sm" onClick={onUpgrade} className="w-full h-10 text-[10px] uppercase font-black bg-indigo-600 text-white shadow-lg shadow-indigo-100">Activate Pro Axis</Button>
        </div>
      )}
    </aside>
  );
};

export default SearchSidebar;
