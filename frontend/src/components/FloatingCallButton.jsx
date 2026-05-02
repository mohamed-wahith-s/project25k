import React from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingCallButton = () => {
  return (
    <motion.a
      href="tel:+919597891731"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[40] w-14 h-14 md:w-14 md:h-14 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center border-4 border-white transition-colors hover:bg-primary-700"
      title="Call for Admissions"
    >
      <Phone size={28} className="md:w-6 md:h-6" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
      </span>
    </motion.a>
  );
};

export default FloatingCallButton;
