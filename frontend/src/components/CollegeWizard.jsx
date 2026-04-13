import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WizardProgress from './wizard/WizardProgress';
import WizardStepCollege from './wizard/WizardStepCollege';
import WizardStepCourse from './wizard/WizardStepCourse';
import WizardStepCaste from './wizard/WizardStepCaste';
import WizardStepResult from './wizard/WizardStepResult';

const STEPS = { COLLEGE: 0, COURSE: 1, CASTE: 2, RESULT: 3 };

export default function CollegeWizard() {
  const [step, setStep] = useState(STEPS.COLLEGE);
  const [selectedCollege, setCollege] = useState(null);
  const [selectedCourse, setCourse] = useState(null);
  const [selectedCaste, setCaste] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const reset = () => { setStep(STEPS.COLLEGE); setCollege(null); setCourse(null); setCaste(null); setCurrentPage(1); };
  const goBack = () => {
    if (step === STEPS.COURSE) setStep(STEPS.COLLEGE);
    else if (step === STEPS.CASTE) setStep(STEPS.COURSE);
    else if (step === STEPS.RESULT) setStep(STEPS.CASTE);
  };

  const pickCollege = (c) => { setCollege(c); setCourse(null); setCaste(null); setStep(STEPS.COURSE); };
  const pickCourse = (c) => { setCourse(c); setCaste(null); setStep(STEPS.CASTE); };
  const pickCaste = (c) => { setCaste(c); setStep(STEPS.RESULT); };

  const resultData = selectedCourse && selectedCaste ? selectedCourse.casteSeats[selectedCaste] : null;

  return (
    <div className="w-full">
      <WizardProgress step={step} STEPS={STEPS} goBack={goBack} reset={reset} selectedCollege={selectedCollege} selectedCourse={selectedCourse} selectedCaste={selectedCaste} />
      <AnimatePresence mode="wait">
        {step === STEPS.COLLEGE && <WizardStepCollege pickCollege={pickCollege} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        {step === STEPS.COURSE && selectedCollege && <WizardStepCourse selectedCollege={selectedCollege} pickCourse={pickCourse} />}
        {step === STEPS.CASTE && selectedCourse && <WizardStepCaste selectedCollege={selectedCollege} selectedCourse={selectedCourse} pickCaste={pickCaste} />}
        {step === STEPS.RESULT && resultData && <WizardStepResult selectedCollege={selectedCollege} selectedCourse={selectedCourse} selectedCaste={selectedCaste} resultData={resultData} reset={reset} />}
      </AnimatePresence>
    </div>
  );
}
