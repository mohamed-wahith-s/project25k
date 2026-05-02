import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from './components/ui';
import { 
  Rocket, ShieldCheck, HeartHandshake, Zap, 
  Search, BookOpen, MessageCircle, BarChart3, 
  ArrowRight, CheckCircle2, Star, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <Search className="text-blue-500" />,
      title: "College Selection",
      description: "Precisely match with top Engineering colleges based on your TNEA cutoffs and community reservation.",
      color: "blue"
    },
    {
      icon: <Sparkles className="text-indigo-500" />,
      title: "Choice Filling Assistant",
      description: "AI-powered recommendations to optimize your TNEA choice filling list for maximum admission probability.",
      color: "indigo"
    },
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: "Admission Guidance",
      description: "Direct support for management and counseling-based admissions in premium institutions across Tamil Nadu.",
      color: "emerald"
    },
    {
      icon: <BookOpen className="text-amber-500" />,
      title: "Scholarship Maps",
      description: "Identify government and private scholarships you're eligible for to reduce your tuition burden.",
      color: "amber"
    },
    {
      icon: <MessageCircle className="text-purple-500" />,
      title: "Expert Counseling",
      description: "One-on-one sessions with TNEA experts who have guided 10,000+ students to their dream careers.",
      color: "purple"
    },
    {
      icon: <BarChart3 className="text-rose-500" />,
      title: "Rank Analytics",
      description: "In-depth analysis of previous years' trends to predict your seat availability in round-wise counseling.",
      color: "rose"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8"
          >
            Your Gateway to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dream Engineering</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            We simplify the complex TNEA admission process with data-driven insights and expert guidance tailored just for you.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/login')} className="px-10 py-6 text-lg bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-200">
              Get Started Now
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button variant="secondary" size="lg" className="px-10 py-6 text-lg border-slate-200 rounded-2xl">
              View All Services
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Our Professional Services</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Comprehensive support for every step of your engineering admission journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border-slate-100 group">
                  <div className={`w-14 h-14 rounded-2xl bg-${service.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-sm">
                    {service.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard number="10K+" label="Students Guided" />
          <StatCard number="400+" label="College Details" />
          <StatCard number="98%" label="Admission Success" />
          <StatCard number="20+" label="Expert Counselors" />
        </div>
      </section>

      {/* CTA section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 text-white/5 uppercase font-black text-9xl pointer-events-none select-none">
              TNEA
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10">
              Ready to Secure Your Seat?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of students who have successfully navigated the TNEA process with our professional help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button size="lg" onClick={() => navigate('/signup')} className="bg-white text-slate-900 hover:bg-slate-50 px-10 py-6 rounded-2xl shadow-xl">
                Create Free Account
              </Button>
              <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-white/10 px-10 py-6 rounded-2xl">
                Contact Hotline
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm font-medium">© 2025 College Diaries PathFinder. All rights reserved.</p>
      </footer>
    </div>
  );
};

const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl font-black text-slate-900 mb-1">{number}</div>
    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default Home;
