import React from 'react';
import { Youtube, Instagram, Phone, Mail, MapPin, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 overflow-hidden relative">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -tr-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-900/20">
                <GraduationCap size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">College Diaries</h3>
                <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] -mt-1">
                  by Dhanasekaran
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Providing expert admission guidance and counseling for over 100+ colleges across Tamil Nadu. Your future starts with the right choice.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://www.youtube.com/@collegediaries9022" icon={<Youtube size={20} />} label="YouTube" />
              <SocialLink href="https://instagram.com/collegediaries1100?igsh=Z3J6dWhpZmdzZDl4" icon={<Instagram size={20} />} label="Instagram" />
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center">
              Guidance Services
            </h4>
            <ul className="space-y-4 text-sm">
              <FooterLink label="Engineering Admissions" />
              <FooterLink label="Medical & Nursing" />
              <FooterLink label="Arts & Science" />
              <FooterLink label="Agriculture & Veterinary" />
              <FooterLink label="Para Medical Courses" />
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <ContactItem 
                icon={<Phone size={18} className="text-primary-500" />} 
                label="Admissions Help"
                value="+91 75500 71233"
                href="tel:+917550071233"
              />
              <ContactItem 
                icon={<Mail size={18} className="text-primary-500" />} 
                label="Email Support"
                value="info@collegediaries.in"
                href="mailto:info@collegediaries.in"
              />
              <ContactItem 
                icon={<MapPin size={18} className="text-primary-500" />} 
                label="Location"
                value="Tamil Nadu, India"
              />
            </div>
          </div>

          {/* Slogan & CTA */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-white font-black text-2xl mb-2 tracking-tight italic">
              Learn <span className="text-primary-500">·</span> Choose <span className="text-primary-500">·</span> Succeed
            </h4>
            <p className="text-slate-400 text-xs mb-6">
              Get personalized counseling for your dream college admission today.
            </p>
            <a 
              href="tel:+917550071233"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full justify-center shadow-lg shadow-primary-900/40"
            >
              <span>Call Now</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-500 font-medium">
             {currentYear} College Diaries. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
            <span className="text-slate-700">|</span>
            <span className="flex items-center text-slate-400">
              Powered by <span className="text-primary-500 ml-1">College Diaries</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3, scale: 1.1 }}
    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-all border border-slate-700/50 shadow-lg"
    aria-label={label}
  >
    {icon}
  </motion.a>
);

const FooterLink = ({ label }) => (
  <li>
    <a href="#" className="hover:text-primary-500 transition-colors flex items-center group">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary-500 mr-2 transition-colors" />
      {label}
    </a>
  </li>
);

const ContactItem = ({ icon, label, value, href }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      {href ? (
        <a href={href} className="text-sm text-slate-300 hover:text-primary-500 transition-colors font-medium">{value}</a>
      ) : (
        <p className="text-sm text-slate-300 font-medium">{value}</p>
      )}
    </div>
  </div>
);

export default Footer;
