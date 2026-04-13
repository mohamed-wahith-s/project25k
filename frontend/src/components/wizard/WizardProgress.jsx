import React from 'react';
import { RotateCcw, ArrowLeft, Building2, BookOpen, Users, Award, ChevronRight } from 'lucide-react';

export default function WizardProgress({ step, STEPS, goBack, reset, selectedCollege, selectedCourse, selectedCaste }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {step > STEPS.COLLEGE && (
            <button
              onClick={goBack}
              className="mt-1 sm:mt-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-primary-100 flex items-center justify-center text-slate-600 hover:text-primary-600 transition-all flex-shrink-0"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top 15 Colleges — Free Access
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Browse seat availability & cutoffs — no subscription required.
            </p>
          </div>
        </div>

        {step > STEPS.COLLEGE && (
          <button
            onClick={reset}
            className="flex items-center text-sm font-bold text-slate-400 hover:text-rose-600 transition-colors gap-1.5 self-start sm:self-center bg-white px-3 py-1.5 rounded-full border border-slate-100 hover:border-rose-200"
          >
            <RotateCcw size={15} /> Start over
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5 text-sm">
        {[
          { label: selectedCollege?.name ?? 'Select College', icon: <Building2 size={13} />, active: step >= STEPS.COLLEGE },
          { label: selectedCourse?.name  ?? 'Select Course',  icon: <BookOpen   size={13} />, active: step >= STEPS.COURSE  },
          { label: selectedCaste         ?? 'Select Caste',   icon: <Users      size={13} />, active: step >= STEPS.CASTE   },
          { label: 'View Results',                             icon: <Award      size={13} />, active: step >= STEPS.RESULT  },
        ].map((crumb, i) => (
          <React.Fragment key={i}>
            <span className={`flex items-center gap-1 font-semibold px-3 py-1.5 rounded-full border ${
              crumb.active
                ? 'bg-primary-50 text-primary-700 border-primary-100'
                : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              {crumb.icon}
              <span className="max-w-[120px] truncate">{crumb.label}</span>
            </span>
            {i < 3 && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
