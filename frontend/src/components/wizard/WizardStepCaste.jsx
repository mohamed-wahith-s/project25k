import React from 'react';
import { motion } from 'framer-motion';
import { casteOptions } from '../../data/topColleges';

export default function WizardStepCaste({ selectedCollege, selectedCourse, pickCaste }) {
  return (
    <motion.div key="caste" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">College & Course</p>
        <p className="text-lg font-black text-slate-900">{selectedCollege.name}</p>
        <p className="text-sm text-primary-600 font-semibold">{selectedCourse.name} · {selectedCourse.totalSeats} seats</p>
      </div>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Select Your Caste Category</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {casteOptions.map((caste) => {
          const data = selectedCourse.casteSeats[caste];
          return (
            <button
              key={caste}
              onClick={() => pickCaste(caste)}
              className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 text-center"
            >
              <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-black px-3 py-1.5 rounded-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {caste}
              </span>
              {data && <p className="text-xs text-slate-500 mt-2 font-medium">{data.seats} seats</p>}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
