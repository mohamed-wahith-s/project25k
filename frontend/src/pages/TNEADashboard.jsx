import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, Sun, ChevronsUpDown, UserCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchSidebar from '../components/SearchSidebar';
import TNEAResultRow from '../components/TNEAResultRow';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import UnlockProCard from '../components/UnlockProCard';
import { Badge } from '../components/ui';

const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];

const TNEADashboard = () => {
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("All");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/colleges');
        const data = await response.json();
        
        // Transform data to match TNEAResultRow expectations
        const transformedData = data.map(college => ({
          ...college,
          branches: college.branches.map(branch => ({
            ...branch,
            cutoffs: {
              OC: branch.oc,
              BC: branch.bc,
              BCM: branch.bcm,
              MBC: branch.mbc,
              SC: branch.sc,
              SCA: branch.sca,
              ST: branch.st
            }
          }))
        }));
        
        setColleges(transformedData);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSubscribed) {
      fetchColleges();
    }
  }, [isSubscribed]);

  const allDepartments = useMemo(() => {
    const depts = new Set(["All"]);
    colleges.forEach(c => {
      c.branches.forEach(b => depts.add(b.branchName));
    });
    return Array.from(depts);
  }, [colleges]);

  const filteredData = useMemo(() => {
    if (!isSubscribed) return [];
    
    let results = [];
    colleges.forEach(college => {
      college.branches.forEach(branch => {
        const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            college.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            branch.branchName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = department === "All" || branch.branchName === department;
        
        const profileCaste = user?.caste || 'OC';
        const profileCutoff = parseFloat(user?.cutoff || 0);
        const requiredCutoff = parseFloat(branch.cutoffs[profileCaste] || 0);
        
        const isEligible = requiredCutoff > 0 && profileCutoff >= requiredCutoff;

        if (matchesSearch && matchesDept && isEligible) {
          results.push({ ...college, dept: branch });
        }
      });
    });
    return results;
  }, [searchQuery, department, isSubscribed, user, colleges]);

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <UnlockProCard onUpgrade={() => navigate('/subscribe')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700">
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden px-8 py-8 gap-8 max-w-[1600px] mx-auto w-full">
        <SearchSidebar 
          selectedCommunities={[user?.caste || 'OC']} 
          department={department} 
          setDepartment={setDepartment} 
          resultsCount={filteredData.length}
          isSubscribed={true}
          hideCategory={true}
          dynamicDepartments={allDepartments}
        />

        <main className="flex-1 min-w-0 pb-20">
          <div className="flex flex-col gap-6">
            <DashboardSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} />
            <TableHeader userCaste={user?.caste || 'OC'} />
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching colleges...</p>
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <TNEAResultRow 
                    key={`${idx}`} 
                    college={item} 
                    dept={item.dept} 
                    communities={communities} 
                    selectedCommunities={[user?.caste || 'OC']}
                    onClick={() => {}}
                  />
                ))
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] py-20 text-center">
                  <Building size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-lg font-black text-slate-900 mb-1">No colleges found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your search or department filter.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Internal Components (< 70 lines)
const DashboardHeader = () => (
  <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#1e293b] rounded-2xl flex items-center justify-center text-white rotate-[-15deg] shadow-lg">
        <GraduationCap size={28} />
      </div>
      <div>
        <h1 className="text-sm font-bold text-slate-900 leading-tight">தமிழ்நாடு இன்ஜினியரிங் கல்லூரி சேர்க்கைகள் - தகுதி மதிப்பெண்கள்</h1>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">TAMILNADU ENGINEERING ADMISSIONS CUTOFFS</p>
      </div>
    </div>
    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Sun size={18} className="text-slate-400" /></button>
  </header>
);

const DashboardSearch = ({ searchQuery, setSearchQuery, user }) => (
  <div className="flex flex-col gap-4">
    <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-200 border border-slate-800">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10"><UserCircle size={28} className="text-blue-400" /></div>
        <div>
          <h2 className="text-lg font-black tracking-tight">{user?.studentName} <span className="text-blue-400 ml-2">●</span></h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Community: {user?.caste} | Cutoff: {user?.cutoff?.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="premium" className="px-4 py-2 premium-gradient text-white border-0 font-black tracking-widest uppercase">Active Pro Axis</Badge>
      </div>
    </div>

    <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search colleges by name or location or branch . . ."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-4 pl-16 text-sm text-slate-600 outline-none font-bold placeholder:text-slate-300"
        />
      </div>
    </div>
  </div>
);

const TableHeader = ({ userCaste }) => (
  <div className="grid grid-cols-[1.5fr_1.5fr_150px] px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left items-center">
    <span>Institution Details</span>
    <span>Branch Detail</span>
    <span className="text-center bg-slate-100 py-1.5 rounded-full text-slate-500">{userCaste} Cutoff / STATUS</span>
  </div>
);

export default TNEADashboard;
