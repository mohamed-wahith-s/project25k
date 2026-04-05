import React, { useState } from 'react';
import { topColleges, casteOptions } from '../data/topColleges';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, CheckCircle2, Building2, BookOpen, Users, Award, ArrowLeft } from 'lucide-react';

const STEPS = {
  COLLEGE: 0,
  COURSE: 1,
  CASTE: 2,
  RESULT: 3,
};

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

export default function CollegeWizard() {
  const [step, setStep]               = useState(STEPS.COLLEGE);
  const [selectedCollege, setCollege] = useState(null);
  const [selectedCourse,  setCourse]  = useState(null);
  const [selectedCaste,   setCaste]   = useState(null);

  const reset = () => {
    setStep(STEPS.COLLEGE);
    setCollege(null);
    setCourse(null);
    setCaste(null);
  };

  const goBack = () => {
    if (step === STEPS.COURSE) {
      setStep(STEPS.COLLEGE);
    } else if (step === STEPS.CASTE) {
      setStep(STEPS.COURSE);
    } else if (step === STEPS.RESULT) {
      setStep(STEPS.CASTE);
    }
  };

  const pickCollege = (college) => {
    setCollege(college);
    setCourse(null);
    setCaste(null);
    setStep(STEPS.COURSE);
  };

  const pickCourse = (course) => {
    setCourse(course);
    setCaste(null);
    setStep(STEPS.CASTE);
  };

  const pickCaste = (caste) => {
    setCaste(caste);
    setStep(STEPS.RESULT);
  };

  // Result data
  const resultData = selectedCourse && selectedCaste
    ? selectedCourse.casteSeats[selectedCaste]
    : null;

  return (
    <div className="w-full">

      {/* Header */}
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

        {/* Breadcrumb trail */}
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

      <AnimatePresence mode="wait">

        {/* STEP 0 — College List */}
        {step === STEPS.COLLEGE && (
          <motion.div
            key="college"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topColleges.map((college) => (
                <button
                  key={college.id}
                  onClick={() => pickCollege(college)}
                  className="group text-left bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all duration-200 flex items-start gap-4"
                >
                  {/* Rank badge */}
                  <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-sm font-black flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                    {college.rank}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors text-sm leading-snug">
                      {college.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{college.city}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[college.type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {college.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${focusColors[college.focus] ?? 'bg-slate-50 text-slate-600'}`}>
                        {college.focus}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="flex-shrink-0 text-slate-300 group-hover:text-primary-500 mt-1 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Course Selection */}
        {step === STEPS.COURSE && selectedCollege && (
          <motion.div
            key="course"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
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
        )}

        {/* STEP 2 — Caste Selection */}
        {step === STEPS.CASTE && selectedCourse && (
          <motion.div
            key="caste"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
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
                    {data && (
                      <p className="text-xs text-slate-500 mt-2 font-medium">{data.seats} seats</p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Result */}
        {step === STEPS.RESULT && resultData && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          >
            {/* Summary card */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-1">Seat Availability</p>
                  <h3 className="text-2xl font-black">{selectedCollege.name}</h3>
                  <p className="text-primary-100 font-medium mt-0.5">{selectedCourse.name}</p>
                </div>
                <span className="bg-white/20 border border-white/30 text-white text-sm font-black px-4 py-2 rounded-xl">
                  {selectedCaste} Category
                </span>
              </div>
            </div>

            {/* Result stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Users size={28} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Available Seats</p>
                  <p className="text-4xl font-black text-primary-700">{resultData.seats}</p>
                  <p className="text-xs text-slate-500 mt-1">out of {selectedCourse.totalSeats} total</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Award size={28} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Min. Required Score</p>
                  <p className="text-2xl font-black text-emerald-700 leading-tight">{resultData.cutoff}</p>
                  <p className="text-xs text-slate-500 mt-1">for {selectedCaste} category</p>
                </div>
              </div>
            </div>

            {/* All categories quick view */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary-500" />
                <span className="font-bold text-slate-900 text-sm">All Categories — Quick View</span>
              </div>
              <div className="divide-y divide-slate-50">
                {casteOptions.map((caste, rowIdx) => {
                  const d = selectedCourse.casteSeats[caste];
                  const isSelected = caste === selectedCaste;
                  return (
                    <div
                      key={caste}
                      className={`grid grid-cols-3 items-center px-5 py-3.5 ${isSelected ? 'bg-primary-50' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full border w-fit ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {caste}
                        {isSelected && ' ✓'}
                      </span>
                      <span className="text-center font-bold text-slate-700 text-sm">
                        {d?.seats ?? '—'}
                        <span className="text-slate-400 font-normal text-xs ml-1">seats</span>
                      </span>
                      <span className="text-right">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {d?.cutoff ?? '—'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={reset}
              className="mt-6 w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              <RotateCcw size={15} className="inline mr-2" />
              Check another college
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
