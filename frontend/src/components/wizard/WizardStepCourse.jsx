import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function WizardStepCourse({ selectedCollege, pickCourse }) {
  return (
    <motion.div key="course" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Selected College</p>
        <p className="text-lg font-black text-slate-900">{selectedCollege.name}</p>
        <p className="text-sm text-slate-500">{selectedCollege.city} · {selectedCollege.type}</p>
      </div>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Choose a Course</p>
      <div className="grid grid-cols-1 gap-3">
        {selectedCollege.courses.map((course, idx) => (
          <button
            key={idx}
            onClick={() => pickCourse(course)}
            className="group text-left bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all duration-200 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600 transition-colors">
                <BookOpen size={18} className="text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{course.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{course.totalSeats} total seats</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
