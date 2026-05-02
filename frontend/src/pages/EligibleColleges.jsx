import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building, Filter, MapPin, GraduationCap,
  AlertTriangle, Lock, ChevronRight, Award, Loader2,
  Target, BookOpen, Users, Settings, Search,
} from 'lucide-react';
import { useApiBase } from '../context/ApiContext';
import ProfessionalCollegeTable from '../components/ui/ProfessionalCollegeTable';

const PAGE_SIZE = 20;

// ── helpers ───────────────────────────────────────────────────────────────────
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export default function EligibleColleges() {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  const API_BASE = useApiBase();

  // Memoize so the fetch effect dep array stays stable across parent re-renders
  const userCutoff = useMemo(() => {
    let c = parseFloat(user?.cutoff ?? user?.cutoff_mark ?? '');
    if (!Number.isFinite(c) && user?.physics_mark != null && user?.chemistry_mark != null && user?.maths_mark != null) {
      c = (parseFloat(user.physics_mark) / 2) + (parseFloat(user.chemistry_mark) / 2) + parseFloat(user.maths_mark);
    }
    return Number.isFinite(c) ? c : null;
  }, [user?.cutoff, user?.cutoff_mark, user?.physics_mark, user?.chemistry_mark, user?.maths_mark]);

  const userCaste = useMemo(() => user?.caste || '', [user?.caste]);

  // Only consider the profile incomplete once auth has finished loading
  const profileIncomplete = !authLoading && (!userCaste || userCutoff === null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [departments,   setDepartments]   = useState([]);
  const [selectedDept,  setSelectedDept]  = useState('All');
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [selectedCollege, setSelectedCollege] = useState(null); // detail view
  const [detailRows,    setDetailRows]    = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isMobileFilter, setIsMobileFilter] = useState(false);

  // ── Fetch departments list ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSubscribed || profileIncomplete) return;
    fetch(`${API_BASE}/colleges/departments`)
      .then(r => r.json())
      .then(j => {
        const allDepts = j?.data || [];
        
        const ALLOWED_DEPARTMENTS = [
          { label: 'CSE - Computer Science and Engineering', keys: ['COMPUTER SCIENCE AND ENGINEERING', 'COMPUTER SCIENCE AND ENGINEERING (SS)', 'M.TECH. COMPUTER SCIENCE'] },
          { label: 'IT - Information Technology', keys: ['INFORMATION TECHNOLOGY', 'INFORMATION TECHNOLOGY (SS)'] },
          { label: 'AIDS - Artificial Intelligence and Data Science', keys: ['ARTIFICIAL INTELLIGENCE AND DATA SCIENCE', 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (SS)', 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', 'COMPUTER SCIENCE AND ENGINEERING (AI AND MACHINE LEARNING)'] },
          { label: 'Cyber Security - Cyber Security', keys: ['CYBER SECURITY', 'COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)'] },
          { label: 'Machine Learning - Machine Learning', keys: ['ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', 'COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)'] },
          { label: 'ECE - Electronics and Communication Engineering', keys: ['ELECTRONICS AND COMMUNICATION ENGINEERING', 'ELECTRONICS AND COMMUNICATION ENGINEERING (SS)'] },
          { label: 'CSBS - Computer Science and Business Systems', keys: ['COMPUTER SCIENCE AND BUSINESS SYSTEM'] },
          { label: 'EEE - Electrical and Electronics Engineering', keys: ['ELECTRICAL AND ELECTRONICS ENGINEERING', 'ELECTRICAL AND ELECTRONICS ENGINEERING (SS)'] },
          { label: 'E&I - Electronics and Instrumentation Engineering', keys: ['ELECTRONICS AND INSTRUMENTATION ENGINEERING', 'INSTRUMENTATION AND CONTROL ENGINEERING'] },
          { label: 'ECE VLSI - Electronics and Communication Engineering (Very Large Scale Integration)', keys: ['ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)', 'ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY) (SS)'] },
          { label: 'Bio Medical - Biomedical Engineering', keys: ['BIOMEDICAL ENGINEERING', 'BIOMEDICAL ENGINEERING (SS)', 'MEDICAL ELECTRONICS ENGINEERING'] },
          { label: 'Bio Technology - Biotechnology Engineering', keys: ['BIOTECHNOLOGY', 'BIOTECHNOLOGY (SS)', 'INDUSTRIAL BIOTECHNOLOGY'] },
          { label: 'Civil - Civil Engineering', keys: ['CIVIL ENGINEERING', 'CIVIL ENGINEERING (SS)', 'CIVIL AND STRUCTURAL ENGINEERING', 'CIVIL ENGINEERING (ENVIRONMENTAL ENGINEERING)'] },
          { label: 'Mech - Mechanical Engineering', keys: ['MECHANICAL ENGINEERING', 'MECHANICAL ENGINEERING (MANUFACTURING)', 'MANUFACTURING ENGINEERING', 'MECHANICAL AND AUTOMATION ENGINEERING'] },
          { label: 'Automobile - Automobile Engineering', keys: ['AUTOMOBILE ENGINEERING', 'MECHANICAL ENGINEERING (AUTOMOBILE)'] },
          { label: 'Agriculture - Agricultural Engineering', keys: ['AGRICULTURAL ENGINEERING'] },
          { label: 'Food Technology - Food Technology Engineering', keys: ['FOOD TECHNOLOGY', 'FOOD TECHNOLOGY (SS)'] },
          { label: 'Robotics - Robotics Engineering', keys: ['ROBOTICS AND AUTOMATION', 'MECHATRONICS ENGINEERING'] }
        ];

        const groupedDepts = [];
        ALLOWED_DEPARTMENTS.forEach(allowed => {
          const matches = allDepts.filter(d => allowed.keys.includes(d.dept_name));
          if (matches.length > 0) {
            groupedDepts.push({
              dept_id: matches.map(m => m.dept_id).join(','), // comma separated for backend 'in' query
              dept_name: allowed.label
            });
          }
        });

        setDepartments(groupedDepts);
      })
      .catch(console.error);
  }, [isSubscribed, profileIncomplete]);

  // ── Fetch eligible college catalog ───────────────────────────────────────
  useEffect(() => {
    // If auth is still resolving, show spinner and wait
    if (authLoading) { setLoading(true); return; }
    // Not subscribed or profile not filled → stop spinner, show gate
    if (!isSubscribed || profileIncomplete) { setLoading(false); return; }

    const ctrl = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const url = new URL(`${API_BASE}/colleges/catalog`);
        url.searchParams.set('pageSize', '2000');
        url.searchParams.set('caste_category', userCaste);
        url.searchParams.set('cutoff_mark', String(userCutoff));
        if (selectedDept !== 'All') url.searchParams.set('dept_id', String(selectedDept));
        const res  = await fetch(url.toString(), { signal: ctrl.signal });
        const json = await res.json();
        let data = json?.data || [];
        // Sort colleges by the highest matching cutoff mark in their inner cutoff_data (descending)
        data.sort((a, b) => {
          const maxA = Math.max(0, ...(a.cutoff_data || []).map(d => parseFloat(d.cutoff_mark) || 0));
          const maxB = Math.max(0, ...(b.cutoff_data || []).map(d => parseFloat(d.cutoff_mark) || 0));
          return maxB - maxA;
        });
        setCatalog(data);
        setCurrentPage(1);
      } catch (e) {
        if (e?.name !== 'AbortError') console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [authLoading, isSubscribed, profileIncomplete, selectedDept, userCaste, userCutoff]);
  
  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // ── Filtered Catalog ──────────────────────────────────────────────────────
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return catalog;

    const normalizedQuery = q.replace(/^0+/, '');
    const isNumeric = /^\d+$/.test(q);

    // Filter by name or code
    return catalog.filter(item => {
      const itemCode = String(item.college_code || "").toLowerCase();
      const itemName = String(item.college_name || "").toLowerCase();
      const itemLoc  = String(item.college_address || "").toLowerCase();
      
      const normalizedItemCode = itemCode.replace(/^0+/, '');

      return (
        itemName.includes(q) || 
        itemLoc.includes(q) || 
        itemCode.includes(q) || 
        (isNumeric && normalizedItemCode === normalizedQuery)
      );
    });
  }, [catalog, searchQuery]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const pagedData  = filteredCatalog.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Fetch college detail rows ─────────────────────────────────────────────
  const handleViewCollege = async (college) => {
    setSelectedCollege(college);
    setDetailRows([]);
    setDetailLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/colleges/details/${college.college_code}`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      const json = await res.json();
      const allRows = json?.data || [];
      
      let eligibleRows = allRows.filter(
        r => r.caste_category === userCaste && parseFloat(r.cutoff_mark) <= userCutoff
      );
      
      // If a specific department filter is applied, only show matching departments in the detail view
      if (selectedDept !== 'All') {
        const selectedIds = selectedDept.split(',');
        eligibleRows = eligibleRows.filter(r => selectedIds.includes(String(r.dept_id)));
      }

      // Find the unique dept_ids that are eligible
      const eligibleDeptIds = new Set(eligibleRows.map(r => r.dept_id));
      
      // Keep ALL rows for those eligible departments so the table can show all castes
      const displayRows = allRows.filter(r => eligibleDeptIds.has(r.dept_id));

      setSelectedCollege({ ...college, _allRowsCount: allRows.length });
      setDetailRows(displayRows);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Show global spinner while auth is resolving ───────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={36} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  // ── Not subscribed ────────────────────────────────────────────────────────
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-100/40 p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Pro Feature</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            Eligible Colleges is exclusive to <strong>Pro Members</strong>. Upgrade to see every college and department you qualify for based on your cutoff and caste.
          </p>
          <button
            onClick={() => navigate('/subscribe')}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Upgrade to Pro <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Profile incomplete ────────────────────────────────────────────────────
  if (profileIncomplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-amber-200 shadow-2xl shadow-amber-100/40 p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Profile Incomplete</h2>
          <p className="text-slate-500 font-medium mb-2 text-sm leading-relaxed">
            To use Eligible Colleges, your <strong>Cutoff Mark</strong> and <strong>Caste Category</strong> must be saved in your profile.
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Go to Settings → Academic Details to fill in these fields.
          </p>
          <button
            onClick={() => {
              // Trigger the settings modal via a custom event that Navbar listens to
              window.dispatchEvent(new CustomEvent('open-settings'));
            }}
            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
          >
            <Settings size={16} /> Open Profile Settings
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  if (selectedCollege) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
          className="min-h-screen bg-slate-50"
        >
          {/* sticky top bar */}
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setSelectedCollege(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Eligible Colleges
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</span>
              <span className="text-sm font-black text-slate-900">{selectedCollege.college_code}</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
            {/* College header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black px-3 py-1 bg-emerald-600 text-white rounded-full uppercase tracking-widest shadow-md shadow-emerald-200">
                  Eligible
                </span>
                <span className="text-[10px] font-black px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-widest">
                  {userCaste} · ≤ {userCutoff}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                {selectedCollege.college_name}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 font-bold">
                <MapPin size={16} className="text-indigo-400" />
                <span className="text-sm">{selectedCollege.college_address || '—'}</span>
              </div>
            </div>

            {/* Department table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
              {detailLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <span className="font-bold text-sm uppercase tracking-widest">Loading…</span>
                </div>
              ) : detailRows.length === 0 ? (
                <div className="py-20 text-center">
                  <Building size={40} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                    No eligible departments found
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    No {userCaste} rows with cutoff ≤ {userCutoff} for this college.
                  </p>
                  <div className="mt-4 p-4 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-500 max-w-xs mx-auto text-left">
                    <p>Debug Info:</p>
                    <p>• total_rows: {selectedCollege?._allRowsCount || 0}</p>
                    <p>• caste: {userCaste}</p>
                    <p>• cutoff: {userCutoff}</p>
                    <p>• dept_filter: {selectedDept}</p>
                  </div>
                </div>
              ) : (
                <ProfessionalCollegeTable college={selectedCollege} rawRows={detailRows} userCaste={userCaste} />
              )}

              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live TNEA Data
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {new Set(detailRows.map(r => r.dept_id)).size} eligible dept(s)
                </span>
              </div>
            </div>
            </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Main list view ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <Target size={14} className="text-emerald-600" />
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Personalised for You</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">Eligible Colleges</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg mx-auto">
            Colleges and departments where your cutoff qualifies you for admission.
          </p>
          {/* User info banner */}
          <div className="inline-flex items-center gap-4 mt-5 px-6 py-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-2 text-white">
              <Users size={14} className="opacity-70" />
              <span className="text-[11px] font-black uppercase tracking-widest">{userCaste}</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2 text-white">
              <Award size={14} className="opacity-70" />
              <span className="text-[11px] font-black uppercase tracking-widest">Cutoff ≤ {userCutoff}</span>
            </div>
          </div>

          {/* Search Bar centered in header */}
          <div className="max-w-3xl mx-auto mt-8">
             <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 pr-6">
               <div className="relative flex-1">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input
                   type="text"
                   placeholder="Course, city, college or code . . ."
                   className="w-full py-4 pl-16 pr-6 text-sm text-slate-600 outline-none font-bold placeholder:text-slate-300 bg-transparent"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 gap-8">
        {/* Mobile filter button */}
        <button
          onClick={() => setIsMobileFilter(true)}
          className="lg:hidden fixed bottom-24 left-6 z-[40] bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
        >
          <Filter size={18} /> Filter
        </button>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {isMobileFilter && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilter(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[51] lg:hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs">
                    <Filter size={16} className="text-indigo-600" /> Department
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <DeptFilter
                    departments={departments}
                    selectedDept={selectedDept}
                    setSelectedDept={(id) => { setSelectedDept(id); setIsMobileFilter(false); }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[11px]">
                <Filter size={14} className="text-indigo-600" /> Department
              </div>
              {selectedDept !== 'All' && (
                <button onClick={() => setSelectedDept('All')} className="text-indigo-600 font-bold text-[10px] uppercase hover:underline">
                  Reset
                </button>
              )}
            </div>
            <div className="p-5">
              <DeptFilter departments={departments} selectedDept={selectedDept} setSelectedDept={setSelectedDept} />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Loader2 size={36} className="text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Finding Your Colleges…</p>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Building size={48} className="text-slate-200" />
              <h3 className="text-lg font-black text-slate-900">{catalog.length === 0 ? 'No eligible colleges found' : 'No search results found'}</h3>
              <p className="text-slate-400 font-medium text-sm">
                {catalog.length === 0 
                  ? 'Try selecting a different department or check your profile cutoff.' 
                  : 'Try a different college name or code.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{filteredCatalog.length} Results</p>
                  {(selectedDept !== 'All' || searchQuery) && (
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight">
                      {searchQuery ? 'Search Applied' : 'Filtered by Branch'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {pagedData.map((college, i) => (
                  <motion.div
                    key={college.college_code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => handleViewCollege(college)}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <GraduationCap size={20} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-700 transition-colors">
                          {college.college_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={11} className="text-slate-300 flex-shrink-0" />
                          <p className="text-[11px] text-slate-400 font-bold truncate">{college.college_address || '—'}</p>
                        </div>
                        <span className="inline-block mt-1.5 text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                          Code: {college.college_code}
                        </span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300">
                      View <ChevronRight size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <button
                    onClick={() => setCurrentPage(p => clamp(p - 1, 1, totalPages))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    ← Prev
                  </button>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => clamp(p + 1, 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dept filter sub-component ─────────────────────────────────────────────────
function DeptFilter({ departments, selectedDept, setSelectedDept }) {
  return (
    <div className="flex flex-col gap-1 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
      {[{ dept_id: 'All', dept_name: 'All Branches' }, ...departments].map((d) => (
        <button
          key={d.dept_id}
          onClick={() => setSelectedDept(d.dept_id)}
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
            selectedDept === d.dept_id
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <span className="truncate">{d.dept_name}</span>
          {selectedDept === d.dept_id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 ml-2" />}
        </button>
      ))}
    </div>
  );
}
