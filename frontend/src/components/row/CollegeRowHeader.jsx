import { School, MapPin, ArrowRight, Unlock } from 'lucide-react';

export default function CollegeRowHeader({ college, isOpen, onViewDetails, onHideDetails }) {

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-5 sm:px-7 sm:py-6 bg-white gap-4">
      {/* Left: Icon + Info */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* College Icon */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border ${college.isFree ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
          <School size={30} />
        </div>

        {/* Name + Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors truncate">
              {college.name}
            </h3>
            {college.isFree && (
              <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0">
                <Unlock size={9} />
                FREE
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Inst Code */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 font-medium">INST</span>
              <span className="text-slate-700 font-bold">{college.code}</span>
            </span>

            {/* Location */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 max-w-xs sm:max-w-sm truncate">
              <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
              <span className="truncate">{college.location}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Action Button */}
      <div className="w-full sm:w-auto flex-shrink-0">
        <button
          onClick={onViewDetails}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-sm ${college.isFree ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          View Full Profile
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
