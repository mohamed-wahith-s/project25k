import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import { 
  GraduationCap, Search, Sparkles, Star, ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <WelcomeBanner name={user?.name} />
      
      <div className="mb-10 flex flex-col md:flex-row items-end justify-between border-b border-slate-100 pb-6">
        <SectionHeader />
        <Button variant="primary" onClick={() => navigate('/tnea')} className="hidden md:flex rounded-2xl bg-slate-900 text-white">
          Explore TNEA Hub
        </Button>
      </div>

      <ServicesGrid navigate={navigate} />
      
      <div className="mt-20 text-center pb-20">
        <Button size="lg" onClick={() => navigate('/tnea')} className="px-12 py-6 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-200 text-lg">
          Start College Search (கல்லூரித் தேடலைத் தொடங்கவும்)
        </Button>
      </div>
    </div>
  );
};

// Internal Sub-Components (< 70 lines each)
const WelcomeBanner = ({ name }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
    <div className="flex items-center justify-center gap-3 text-blue-600 mb-4">
      <GraduationCap size={24} />
      <span className="text-xs font-black uppercase tracking-[0.3em]">Premium Counseling Hub</span>
    </div>
    <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-4">Welcome back, {name}! 👋</h1>
    <p className="text-xl text-slate-600 font-medium">Your journey to the right engineering college starts here.</p>
    <p className="text-lg text-blue-600 font-bold">பொறியியல் கல்லூரிக்கான உங்களின் பயணம் இங்கிருந்து தொடங்குகிறது.</p>
  </motion.div>
);

const SectionHeader = () => (
  <div>
    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Our Specialized Services</h2>
    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest flex items-center gap-2">
      Professional Guidance <span className="w-1 h-1 bg-slate-300 rounded-full" /> தொழில்முறை வழிகாட்டுதல்
    </p>
  </div>
);

const ServicesGrid = ({ navigate }) => {
  const services = [
    { en: "College Selection", ta: "கல்லூரி தேர்வு", icon: <Search className="text-blue-500" />, desc_en: "Precisely match with top Engineering colleges based on your TNEA cutoffs.", desc_ta: "உங்கள் TNEA கட்-ஆஃப் அடிப்படையில் சிறந்த பொறியியல் கல்லூரிகளுடன் பொருந்துங்கள்." },
    { en: "Choice Filling Assistant", ta: "விருப்பப் பட்டியல் உதவி", icon: <Sparkles className="text-indigo-500" />, desc_en: "AI-powered recommendations to optimize your choice list.", desc_ta: "உங்கள் விருப்பப் பட்டியலை மேம்படுத்த விரிவான AI-ஆதார பரிந்துரைகள்." },
    { en: "Expert Counseling", ta: "நிபுணர் ஆலோசனைகள்", icon: <Star className="text-purple-500" />, desc_en: "One-on-one sessions with TNEA experts.", desc_ta: "நிபுணர்களுடன் நேருக்கு நேர் ஆலோசனைகள்." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {services.map((service, i) => (
        <Card key={i} className="p-8 hover:shadow-2xl transition-all border-slate-100 bg-white h-full group">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{service.icon}</div>
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 mb-2">{service.en}</h3>
            <p className="text-sm text-slate-500 font-medium">{service.desc_en}</p>
          </div>
          <div className="pt-6 border-t border-slate-50">
            <h4 className="text-lg font-bold text-blue-700 mb-2">{service.ta}</h4>
            <p className="text-xs text-slate-400 font-bold">{service.desc_ta}</p>
          </div>
          <button onClick={() => navigate('/subscribe')} className="mt-8 flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors">
            Learn More <ArrowRight size={14} />
          </button>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
