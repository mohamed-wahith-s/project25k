import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CollegeRowHeader from './row/CollegeRowHeader';
import CollegeRowTable from './row/CollegeRowTable';

export default function CollegeRow({ college, selectedCommunity, onViewProfile, onExpand }) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredDepartments = college.departments || [];

  const handleViewDetails = async () => {
    await onExpand?.(college);
    setIsOpen(true);
  };

  const handleHideDetails = () => setIsOpen(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden group">
      <CollegeRowHeader
        college={college}
        isOpen={isOpen}
        onViewDetails={handleViewDetails}
        onHideDetails={handleHideDetails}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#FCFDFF] border-t border-slate-50">
            <CollegeRowTable filteredDepartments={filteredDepartments} selectedCommunity={selectedCommunity} />
            <div className="p-6 bg-slate-50/50 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Focused</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seat Matrix Validated</span></div>
              </div>
              <button
                onClick={(e) => {
                  onViewProfile?.(college);
                }}
                className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                View Full Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
