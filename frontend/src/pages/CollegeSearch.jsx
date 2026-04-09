import React, { useState, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Search, ChevronsUpDown, X, Building, MapPin, GraduationCap, Users, Award, ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import tneaData from '../data/tnea_data.json';
import { topColleges } from '../data/topColleges';
import TNEAResultRow from '../components/TNEAResultRow';
import UnlockProCard from '../components/UnlockProCard';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

const CollegeSearch = () => {
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  const [selectedCommunities, setSelectedCommunities] = useState(["OC"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const filteredData = useMemo(() => {
    let rawResults = [];
    
    if (isSubscribed) {
      tneaData.forEach(college => {
        college.departments.forEach(dept => {
          rawResults.push({ ...college, dept });
        });
      });
    } else {
      // Free Axis: Map Top Colleges to TNEA format
      topColleges.forEach(college => {
        college.courses?.forEach(course => {
          const cutoffs = {};
          communities.forEach(c => {
            const raw = course.casteSeats?.[c]?.cutoff || "-";
            cutoffs[c] = raw.replace(/[^0-9.]/g, '') || raw;
          });
          
          rawResults.push({
            id: college.id,
            name: college.name,
            location: college.city,
            isFree: true,
            dept: {
              branchName: course.name,
              code: "VERIFIED",
              cutoffs: cutoffs,
              seats: course.casteSeats // Storing full seat info for free clgs
            }
          });
        });
      });
    }

    const filtered = rawResults.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dept.branchName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered;
  }, [searchQuery, isSubscribed]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedDetail ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-1 flex-col px-8 py-8 gap-8 max-w-[1200px] mx-auto w-full"
          >
            <main className="flex-1 min-w-0">
              <div className="flex flex-col gap-8">
                <div className="mb-4 text-center">
                  <h1 className="text-4xl font-black text-slate-900 mb-2">Find Your College</h1>
                  <p className="text-slate-500 font-medium tracking-tight">Search among 500+ Engineering institutions across Tamil Nadu.</p>
                </div>
                
                <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <TableHeader communities={communities} />

                <div className="space-y-3 pb-20">
                  {filteredData.map((item, idx) => (
                    <TNEAResultRow 
                      key={`${item.id}-${idx}`} 
                      college={item} 
                      dept={item.dept} 
                      communities={communities} 
                      selectedCommunities={selectedCommunities}
                      onClick={() => {
                        if (item.isFree) {
                          setSelectedDetail(item);
                        } else if (!isSubscribed) {
                          navigate('/subscribe');
                        }
                      }}
                    />
                  ))}

                  {!isSubscribed && <UnlockProCard onUpgrade={() => navigate('/subscribe')} />}
                </div>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 bg-white min-h-screen"
          >
            <CollegeDetailView 
              item={selectedDetail} 
              onClose={() => setSelectedDetail(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CollegeDetailView = ({ item, onClose }) => (
  <div className="flex flex-col min-h-screen">
    {/* Navigation Bar */}
    <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>
      <div className="flex items-center gap-3">
        <Building size={16} className="text-slate-400" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.id}</span>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary-50 text-primary-600 text-[10px] font-black px-3 py-1 rounded-full border border-primary-100 uppercase tracking-widest">
              Free Access
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
            {item.name}
          </h1>
          <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
            <MapPin size={20} className="text-slate-300" /> {item.location}
          </p>
        </div>
        <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 shadow-xl shadow-slate-100">
          <Building size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Branch Detail */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <GraduationCap size={28} />
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Course Detail</p>
                <h3 className="text-2xl font-black tracking-tight">{item.dept.branchName}</h3>
                <p className="text-white/40 text-xs font-bold mt-1 uppercase tracking-widest">Code: {item.dept.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <StatPiece label="Total Seats" value="-" /> {/* Note: Could show from data if added */}
              <StatPiece label="Rank Trend" value="Up" />
              <StatPiece label="Placement" value="98%" />
              <StatPiece label="Accredited" value="NBA" />
            </div>
          </section>

          {/* Seat Breakdown */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users size={20} className="text-primary-600" /> Community-wise Breakdown
              </h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-100">
              <div className="grid grid-cols-3 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                <div className="text-left">Category</div>
                <div>Available Seats</div>
                <div className="text-right">Cutoff Score</div>
              </div>
              <div className="divide-y divide-slate-50">
                {communities.map(c => {
                  const info = item.dept.seats?.[c];
                  return (
                    <div key={c} className="grid grid-cols-3 px-8 py-6 items-center hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 text-left">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center border border-indigo-100 uppercase">
                          {c}
                        </span>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{c} Category</span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-primary-600">{info?.seats || "0"}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Seats</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 text-[13px] font-black">
                          <Award size={12} />
                          {info?.cutoff?.replace("TNEA ≥ ", "") || "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">

          
          <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary-100">
            <Zap size={24} className="mb-4" />
            <h4 className="text-lg font-black mb-2">Want deeper insights?</h4>
            <p className="text-white/70 text-sm font-medium mb-6">Get round-wise cutoff predictions and personalized choice filling assistance.</p>
            <button 
              onClick={() => navigate('/subscribe')}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-102 transition-transform"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <button 
          onClick={onClose}
          className="px-10 py-5 premium-gradient text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          Return to search list
        </button>
      </div>
    </div>
  </div>
);

const StatPiece = ({ label, value }) => (
  <div>
    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);



// Internal Sub-Components (Keep each under 70 lines)
const SearchHeader = ({ searchQuery, setSearchQuery }) => (
  <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 pr-6">
    <div className="relative flex-1">
      <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
      <input 
        type="text" 
        placeholder="Course, city, college or code . . ."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-4 pl-16 pr-6 text-sm text-slate-600 outline-none font-bold placeholder:text-slate-300 bg-transparent"
      />
    </div>
  </div>
);

const TableHeader = ({ communities }) => (
  <div className="grid grid-cols-[1.5fr_1.5fr_repeat(7,60px)] px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center items-center">
    <HeaderItem label="Institution" />
    <HeaderItem label="Branch Detail" />
    {communities.map(comm => <HeaderItem key={comm} label={comm} />)}
  </div>
);

const HeaderItem = ({ label }) => (
  <div className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors group">
    <span>{label}</span>
    <ChevronsUpDown size={10} className="group-hover:text-blue-500" />
  </div>
);

export default CollegeSearch;
