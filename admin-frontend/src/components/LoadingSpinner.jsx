import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ text = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner spinning gradient ring */}
        <motion.div
          className="w-16 h-16 border-[5px] border-t-primary border-r-primary/50 border-b-primary/10 border-l-primary/10 rounded-full drop-shadow-md z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-primary rounded-full z-20" />
      </div>
      <motion.p 
        className="mt-8 text-lg font-medium text-primary tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
