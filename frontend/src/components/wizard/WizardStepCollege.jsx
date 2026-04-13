import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { topColleges } from '../../data/topColleges';

const typeColors = {
  Government:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Govt-Aided': 'bg-teal-50 text-teal-700 border-teal-200',
  Private:     'bg-violet-50 text-violet-700 border-violet-200',
};

const focusColors = {
  Engineering:              'bg-blue-50   text-blue-700',
  'Engineering / Medical':  'bg-cyan-50    text-cyan-700',
  'Engineering / Law':      'bg-indigo-50  text-indigo-700',
  Medical:                  'bg-rose-50    text-rose-700',
  'Medical / Dental':       'bg-pink-50    text-pink-700',
  'Arts & Science':         'bg-amber-50   text-amber-700',
};

export default function WizardStepCollege({ pickCollege, currentPage, setCurrentPage }) {
  const ITEMS_PER_PAGE = 8;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentColleges = topColleges.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(topColleges.length / ITEMS_PER_PAGE);

  return (
    <motion.div key="college" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentColleges.map((college) => (
          <button
            key={college.id}
            onClick={() => pickCollege(college)}
            className="group text-left bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all duration-200 flex items-start gap-4"
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-sm font-black flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
              {college.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors text-sm leading-snug">{college.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{college.city}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[college.type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{college.type}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${focusColors[college.focus] ?? 'bg-slate-50 text-slate-600'}`}>{college.focus}</span>
              </div>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 text-slate-300 group-hover:text-primary-500 mt-1 transition-colors" />
          </button>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
