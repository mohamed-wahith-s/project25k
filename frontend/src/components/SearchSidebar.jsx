import React from 'react';
import { Filter, LayoutGrid, Building, ChevronDown, Lock } from 'lucide-react';
import { Button } from './ui';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];
const departments = ["All", "Artificial Intelligence and Data Science", "Computer Science and Engineering", "Information Technology", "Mechanical Engineering", "Electronics and Communication Engineering", "Electrical and Electronics Engineering", "Civil Engineering"];

const SearchSidebar = ({ 
  selectedCommunities, 
  toggleCommunity, 
  department, 
  setDepartment, 
  resultsCount, 
  isSubscribed, 
  onUpgrade,
  hideCategory = false
}) => {
  return (
    <aside className="w-[280px] bg-white border border-slate-200 rounded-xl p-6 flex flex-col h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-6 font-bold text-slate-800 text-lg">
        <Filter size={20} />
        <h2>Filters</h2>
      </div>

      <div className="space-y-6 flex-1">
        {!hideCategory && (
          <section>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3">
              <LayoutGrid size={14} />
              <span>Communities</span>
            </div>
            <div className="space-y-2">
              {communities.map(comm => (
                <label key={comm} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedCommunities.includes(comm)}
                    onChange={() => toggleCommunity(comm)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{comm}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3">
            <Building size={14} />
            <span>Department</span>
          </div>
          <div className="relative">
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-50 transition-all pr-8"
            >
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">{resultsCount} results</span>
      </div>
      
      {!isSubscribed && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Lock size={10} /> Free Mode
          </p>
          <p className="text-[11px] text-blue-500 font-bold leading-tight mb-3">Showing top 20. Unlock all 500+.</p>
          <Button size="sm" onClick={onUpgrade} className="w-full h-8 text-[10px] uppercase font-black bg-blue-600 text-white">Upgrade Now</Button>
        </div>
      )}
    </aside>
  );
};

export default SearchSidebar;
