import React, { useState, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import tneaData from '../data/tnea_data.json';
import { topColleges } from '../data/topColleges';
import TNEAResultRow from '../components/TNEAResultRow';
import UnlockProCard from '../components/UnlockProCard';
import SearchHeader from '../components/search/SearchHeader';
import TNEATableHeader from '../components/search/TNEATableHeader';
import CollegeDetailView from '../components/search/CollegeDetailView';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

const CollegeSearch = () => {
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const userCaste = user?.caste || "OC";
  const displayCommunities = communities;

  const filteredData = useMemo(() => {
    let rawResults = [];
    if (isSubscribed) {
      tneaData.forEach(college => {
        college.departments.forEach(dept => {
          rawResults.push({ ...college, dept });
        });
      });
    } else {
      topColleges.forEach(college => college.courses?.forEach(course => {
        const cutoffs = {}; communities.forEach(c => { const raw = course.casteSeats?.[c]?.cutoff || "-"; cutoffs[c] = raw.replace(/[^0-9.]/g, '') || raw; });
        rawResults.push({ id: college.id, name: college.name, location: college.city, isFree: true, dept: { branchName: course.name, code: "VERIFIED", cutoffs, seats: course.casteSeats } });
      }));
    }
    return rawResults.filter(item => {
      return [item.name, item.location, item.dept.branchName].some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [searchQuery, isSubscribed]);

  const [showUnlock, setShowUnlock] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!selectedDetail ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-1 flex-col px-8 py-8 gap-10 max-w-[1200px] mx-auto w-full items-center">
            <main className="flex-1 w-full">
              <div className="flex flex-col gap-8">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">College Search</h1>
                  <p className="text-slate-500 font-medium tracking-tight">Access the complete TNEA cutoff database for all categories.</p>
                </div>
                <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <TNEATableHeader communities={displayCommunities} />
                <div className="space-y-3 pb-20">
                  {filteredData.map((item, idx) => (
                    <TNEAResultRow 
                      key={`${item.id}-${idx}`} 
                      college={item} 
                      dept={item.dept} 
                      communities={displayCommunities} 
                      selectedCommunities={[userCaste]} 
                      onClick={() => setSelectedDetail(item)} 
                    />
                  ))}
                  
                  {!isSubscribed && (
                    <div className="pt-6">
                      {!showUnlock ? (
                        <div className="flex justify-center">
                          <button 
                            onClick={() => setShowUnlock(true)}
                            className="bg-white border border-slate-200 px-10 py-4 rounded-[2rem] text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3 group"
                          >
                            Explore More Colleges
                            <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                              ↓
                            </motion.span>
                          </button>
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                          <UnlockProCard onUpgrade={() => navigate('/subscribe')} />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 bg-white min-h-screen">
            <CollegeDetailView item={selectedDetail} onClose={() => setSelectedDetail(null)} onSubscribe={() => navigate('/subscribe')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollegeSearch;
