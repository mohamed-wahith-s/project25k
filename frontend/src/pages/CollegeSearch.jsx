import React, { useState, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { Search, Download, ChevronsUpDown } from 'lucide-react';
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
            dept: {
              branchName: course.name,
              code: "VERIFIED",
              cutoffs: cutoffs
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

    return isSubscribed ? filtered : filtered.slice(0, 20);
  }, [searchQuery, isSubscribed]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700">
      <div className="flex flex-1 flex-col px-8 py-8 gap-8 max-w-[1200px] mx-auto w-full">
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
                  onClick={() => !isSubscribed && navigate('/subscribe')}
                />
              ))}

              {!isSubscribed && <UnlockProCard onUpgrade={() => navigate('/subscribe')} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

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
