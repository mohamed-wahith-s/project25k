import React from 'react';
import CollegeRowHeader from './row/CollegeRowHeader';

export default function CollegeRow({ college, selectedCommunity, onViewProfile, onExpand }) {
  const handleViewDetails = async () => {
    // If we need to fetch details before viewing profile, let the parent handle it
    // Or just call onViewProfile directly and let the parent fetch it.
    onViewProfile?.(college);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden group">
      <CollegeRowHeader
        college={college}
        isOpen={false}
        onViewDetails={handleViewDetails}
        onHideDetails={() => {}}
      />
    </div>
  );
}
