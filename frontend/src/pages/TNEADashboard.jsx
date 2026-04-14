import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, Sun, UserCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TNEAResultRow from '../components/TNEAResultRow';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import UnlockProCard from '../components/UnlockProCard';
import CollegeDetailView from '../components/search/CollegeDetailView';

const TNEADashboard = () => {
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/colleges`);
        const json = await response.json();
        const rawData = json.data || [];
        
        // Keep the full raw data to find all branches for a college later
        setColleges(rawData);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSubscribed) fetchColleges();
  }, [isSubscribed]);

  // Unique list of college-branch pairs for the main directory
  const directoryData = useMemo(() => {
    if (!isSubscribed) return [];
    const seen = new Set();
    return colleges.filter(item => {
      const key = `${item.college_code}-${item.dept_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [colleges, isSubscribed]);

  const filteredData = useMemo(() => {
    return directoryData.filter(item => {
      const collegeName = (item.colleges?.college_name || "").toLowerCase();
      const collegeCode = (item.college_code || "").toLowerCase();
      const deptName = (item.departments?.dept_name || "").toLowerCase();
      const location = (item.colleges?.college_address || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      return collegeName.includes(query) || collegeCode.includes(query) || 
             deptName.includes(query) || location.includes(query);
    });
  }, [searchQuery, directoryData]);

  const handleViewMore = (item) => {
    // Collect all raw rows for this specific college for the detailed table
    const collegeRawRows = colleges.filter(c => c.college_code === item.college_code);

    // Maintain the departments array for fallback support
    const collegeBranches = collegeRawRows.map(c => ({
      branchName: c.departments?.dept_name,
      code: c.subject_code,
      cutoffs: {
        OC: c.oc_cutoff,
        BC: c.bc_cutoff,
        BCM: c.bcm_cutoff,
        MBC: c.mbc_cutoff,
        SC: c.sc_cutoff,
        SCA: c.sca_cutoff,
        ST: c.st_cutoff
      }
    }));

    setSelectedDetail({
      name: item.colleges?.college_name || item.college_name,
      location: item.colleges?.college_address || item.college_address,
      college_code: item.college_code,
      departments: collegeBranches,
      rawRows: collegeRawRows // Essential for the new Mega-Table layout
    });
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <UnlockProCard onUpgrade={() => navigate('/subscribe')} />
      </div>
    );
  }

  if (selectedDetail) {
    return (
      <CollegeDetailView 
        item={selectedDetail} 
        onClose={() => setSelectedDetail(null)} 
        onSubscribe={() => navigate('/subscribe')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 pb-20">
      <DashboardHeader />
      
      <div className="flex-1 px-8 py-8 max-w-[1200px] mx-auto w-full">
        <main className="flex flex-col gap-6">
          <DashboardSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} />
          
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <TableHeader />
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating Directory...</p>
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <TNEAResultRow 
                    key={idx} 
                    college={{
                      name: item.colleges?.college_name,
                      location: item.colleges?.college_address,
                      college_code: item.college_code
                    }} 
                    dept={{
                      branchName: item.departments?.dept_name,
                      code: item.subject_code
                    }} 
                    onClick={() => handleViewMore(item)}
                  />
                ))
              ) : (
                <div className="bg-white py-20 text-center">
                  <Building size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-lg font-black text-slate-900 mb-1">No results found</h3>
                  <p className="text-slate-500 font-medium text-sm">Try searching by name or code (e.g. "1")</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardHeader = () => (
  <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
        <GraduationCap size={24} />
      </div>
      <div>
        <h1 className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight">TNEA College Directory</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TAMILNADU ENGINEERING ADMISSIONS</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Sun size={18} /></button>
    </div>
  </header>
);

const DashboardSearch = ({ searchQuery, setSearchQuery, user }) => (
  <div className="flex flex-col gap-6">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
          <UserCircle size={32} className="text-indigo-300" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">{user?.studentName || 'Student Profile'}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PRO MEMBER ● {user?.caste || 'OC'} CATEGORY
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 relative z-10">
        <div className="px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-200">
          Rank Analysis Enabled
        </div>
      </div>
    </div>

    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
        <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input 
        type="text" 
        placeholder="Search by Institution name, Branch, or College Code (e.g. 2711) . . ."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 py-5 pl-16 pr-8 rounded-[2rem] text-sm text-slate-700 outline-none font-bold placeholder:text-slate-300 shadow-sm transition-all"
      />
    </div>
  </div>
);

const TableHeader = () => (
  <div className="grid grid-cols-[80px_2.5fr_2fr_120px] px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-left items-center bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
    <span className="text-center">Code</span>
    <span>Institution Details</span>
    <span>Branch Detail</span>
    <span className="text-right pr-6">Action</span>
  </div>
);

export default TNEADashboard;
