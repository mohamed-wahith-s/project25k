import React, { useState, useMemo } from 'react';
import { Search, GraduationCap, Sun, UserCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TNEAResultRow from '../components/TNEAResultRow';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { useColleges } from '../context/CollegeContext';
import { useApiBase } from '../context/ApiContext';
import UnlockProCard from '../components/UnlockProCard';
import CollegeDetailView from '../components/search/CollegeDetailView';

const TNEADashboard = () => {
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  const { collegedetails, loadingColleges } = useColleges();
  const navigate = useNavigate();
  const API_URL = useApiBase();
  
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const filteredData = useMemo(() => {
    if (!isSubscribed || !collegedetails) return [];
    
    const q = searchQuery.toLowerCase().trim();
    if (!q) return collegedetails;

    const normalizedQuery = q.replace(/^0+/, '');
    const isNumeric = /^\d+$/.test(q);

    // 1. Strict Code Match (Priority)
    if (isNumeric) {
      const strictMatches = collegedetails.filter(item => 
        String(item.college_code || "").toLowerCase().replace(/^0+/, '') === normalizedQuery
      );
      if (strictMatches.length > 0) return strictMatches;
    }

    // 2. Broad Search (Fallback)
    return collegedetails.filter(item => {
      const itemCode = String(item.college_code || "").toLowerCase();
      const itemName = String(item.college_name || "").toLowerCase();
      const itemLoc  = String(item.college_address || "").toLowerCase();

      return itemName.includes(q) || itemLoc.includes(q) || itemCode.includes(q);
    });
  }, [searchQuery, collegedetails, isSubscribed]);

  const handleViewMore = async (item) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`${API_URL}/colleges/details/${item.college_code}`);
      const json = await response.json();

      if (json?.success) {
        setSelectedDetail({
          name: item.college_name,
          location: item.college_address,
          college_code: item.college_code,
          rawRows: json.data // All branches and cutoffs for this college
        });
      } else {
        alert("Could not load details for this college.");
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      alert("Error loading details. Please try again.");
    } finally {
      setDetailLoading(false);
    }
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
              {loadingColleges ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating Directory...</p>
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, idx) => {
                  const branchCount = item.cutoff_data?.[0]?.count || 0;
                  return (
                    <TNEAResultRow 
                      key={idx} 
                      college={{
                        name: item.college_name,
                        location: item.college_address,
                        college_code: item.college_code,
                        branchCount: branchCount
                      }} 
                      loading={detailLoading && selectedDetail?.college_code === item.college_code}
                      onClick={() => handleViewMore(item)}
                    />
                  );
                })
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
      
      {/* Detail Fetching Loader */}
      {detailLoading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Loading College Data...</p>
          </div>
        </div>
      )}
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
        placeholder="Search by Institution name or College Code (e.g. 2711) . . ."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 py-5 pl-16 pr-8 rounded-[2rem] text-sm text-slate-700 outline-none font-bold placeholder:text-slate-300 shadow-sm transition-all"
      />
    </div>
  </div>
);

const TableHeader = () => (
  <div className="grid grid-cols-[80px_2.5fr_1fr_120px] px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-left items-center bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
    <span className="text-center">Code</span>
    <span>Institution Details</span>
    <span className="text-center">Availability</span>
    <span className="text-right pr-6">Action</span>
  </div>
);
export default TNEADashboard;
