import React, { useState, useEffect } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { colleges, courses } from '../data/colleges';
import { Button, Input, Card, Badge } from '../components/ui';
import { Search, Filter, MapPin, GraduationCap, Lock, Zap, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CollegeSearch = () => {
  const { isSubscribed } = useSubscription();
  const [cutoff, setCutoff] = useState('');
  const [course, setCourse] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isSubscribed) return;

    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = colleges.filter(college => {
        const matchesCutoff = cutoff === '' || college.cutoff <= parseFloat(cutoff);
        const matchesCourse = course === '' || college.course === course;
        return matchesCutoff && matchesCourse;
      });
      setResults(filtered);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">TNEA College Finder</h1>
          <p className="text-slate-500 font-medium">Explore top Tamil Nadu engineering colleges based on your cutoff score.</p>
        </div>
        {!isSubscribed && (
          <Badge variant="premium" className="px-4 py-2 text-sm flex items-center space-x-2 bg-indigo-50 text-indigo-700 border-indigo-100">
            <Star size={14} fill="currentColor" />
            <span>Premium Required for Advanced Search</span>
          </Badge>
        )}
      </div>

      {/* Search Header */}
      <Card className="mb-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {!isSubscribed && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Search is Locked</h2>
              <p className="text-slate-500 mb-8">
                Subscribe to PathFinder Pro to access our database of over 500+ colleges and detailed admission criteria.
              </p>
              <Button variant="premium" size="lg" className="w-full" onClick={() => navigate('/subscribe')}>
                Get Pro Access
                <Zap size={18} className="ml-2" />
              </Button>
            </motion.div>
          </div>
        )}

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Input
              label="Your TNEA Cutoff Score"
              type="number"
              step="0.01"
              placeholder="e.g. 195.5"
              value={cutoff}
              onChange={(e) => setCutoff(e.target.value)}
              disabled={!isSubscribed}
            />
          </div>
          <div className="md:col-span-5">
            <label className="text-sm font-medium text-slate-700 ml-1 block mb-1.5">Select Preferred Course</label>
            <select
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 text-slate-700"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!isSubscribed}
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-3 flex items-end">
            <Button
              type="submit"
              className="w-full py-[11px]"
              disabled={!isSubscribed || isSearching}
              isLoading={isSearching}
            >
              <Search size={20} className="mr-2" />
              Search Colleges
            </Button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </motion.div>
          ) : !hasSearched ? (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 text-slate-400">
                <Filter size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Your results will appear here</h2>
              <p className="text-slate-500 mt-2">Adjust the filters above to find matching colleges.</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {results.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">No matching colleges found</h2>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Try lowering your cutoff or selecting a different course preference.</p>
              <Button 
                variant="secondary" 
                className="mt-8"
                onClick={() => { setCutoff(''); setCourse(''); setHasSearched(false); }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CollegeCard = ({ college }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
  >
    <Card className="h-full group hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 hover:-translate-y-2 border-slate-100" noPadding>
      <div className="relative h-48 overflow-hidden rounded-t-[2.5rem]">
        <img 
          src={college.image} 
          alt={college.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <Badge variant={college.type === 'Private' ? 'info' : 'success'} className="backdrop-blur-md bg-white/90 border-transparent shadow-sm">
            {college.type}
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-white/20 flex items-center space-x-1">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-slate-900">{college.rating}</span>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{college.name}</h3>
            <div className="flex items-center text-slate-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              {college.location}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-600 font-medium">
              <GraduationCap size={18} className="mr-2 text-primary-500" />
              <span>{college.course}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">TNEA Cutoff</span>
            <span className="text-primary-700 font-extrabold text-lg px-3 py-0.5 bg-primary-50 rounded-xl">{college.cutoff}</span>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-8 group/btn" size="md">
          Learn More
          <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  </motion.div>
);

const SkeletonCard = () => (
  <Card className="h-[480px] border-slate-100 animate-pulse bg-slate-50" noPadding>
    <div className="h-48 bg-slate-200 rounded-t-[2.5rem]"></div>
    <div className="p-8 space-y-6">
      <div className="space-y-3">
        <div className="h-6 bg-slate-200 rounded-full w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded-full w-1/2"></div>
      </div>
      <div className="h-px bg-slate-100 w-full"></div>
      <div className="space-y-4">
        <div className="h-5 bg-slate-200 rounded-full w-full"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
          <div className="h-8 bg-slate-200 rounded-xl w-1/4"></div>
        </div>
      </div>
      <div className="h-12 bg-slate-200 rounded-xl w-full mt-4"></div>
    </div>
  </Card>
);

export default CollegeSearch;
