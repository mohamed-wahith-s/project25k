import React from 'react';

const StatPiece = ({ label, value }) => (
  <div>
    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);

export default function DetailStatGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <StatPiece label="Total Seats" value="-" />
      <StatPiece label="Rank Trend" value="Up" />
      <StatPiece label="Placement" value="98%" />
      <StatPiece label="Accredited" value="NBA" />
    </div>
  );
}
