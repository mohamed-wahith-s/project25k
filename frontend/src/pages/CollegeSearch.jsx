import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Filter, Search, X, Menu, Lock } from 'lucide-react';
import CollegeRow from '../components/CollegeRow';
import UnlockProCard from '../components/UnlockProCard';
import SearchHeader from '../components/search/SearchHeader';
import CollegeDetailView from '../components/search/CollegeDetailView';
import { getApiBase, joinApi } from '../utils/apiBase';

const PAGE_SIZE = 20;

// ─── Helper ────────────────────────────────────────────────────────────────
// Pivots flat rows (one row per caste per branch) into:
//   { college_code → { name, location, departments: [{ branchName, code, cutoffs:{OC,BC,...} }] } }
function groupRawRows(rows) {
  const collegeMap = {};
  rows.forEach(row => {
    const code = row.college_code;
    if (!collegeMap[code]) {
      collegeMap[code] = {
        college_code: code,
        name: row.colleges?.college_name || code,
        location: row.colleges?.college_address || '',
        departments: {},
        rawRows: [] // Store original DB rows for the collapsible table
      };
    }
    
    // Add raw row for this college
    collegeMap[code].rawRows.push(row);

    // Some datasets have missing/duplicated dept_id; use a stable composite key so
    // departments don't get merged and "disappear" in the dropdown.
    const deptKey = [
      row.dept_id ?? row.departments?.dept_id ?? 'na',
      row.subject_code ?? row.departments?.subject_code ?? 'na',
      row.departments?.dept_name ?? 'na',
    ].join('|');

    if (!collegeMap[code].departments[deptKey]) {
      collegeMap[code].departments[deptKey] = {
        branchName: row.departments?.dept_name || '',
        code: row.departments?.subject_code || row.subject_code || '',
        cutoffs: {},
        ranks: {},
        seats: {},
        seatsFilling: {},
      };
    }
    const caste = row.caste_category;
    if (caste) {
      const dept = collegeMap[code].departments[deptKey];

      // Some colleges have multiple rows per (dept,caste). Don't let a later null/blank
      // overwrite a real value.
      const prevCutoff = dept.cutoffs[caste];
      const nextCutoff = row.cutoff_mark;
      const prevCutoffNum = Number.isFinite(Number.parseFloat(prevCutoff)) ? Number.parseFloat(prevCutoff) : null;
      const nextCutoffNum = Number.isFinite(Number.parseFloat(nextCutoff)) ? Number.parseFloat(nextCutoff) : null;
      if (nextCutoffNum !== null) {
        // Keep the maximum cutoff seen (safest for "latest/strongest" display).
        dept.cutoffs[caste] =
          prevCutoffNum !== null ? Math.max(prevCutoffNum, nextCutoffNum) : nextCutoffNum;
      } else if (prevCutoff === undefined) {
        dept.cutoffs[caste] = '-';
      }

      if ((dept.ranks[caste] === undefined || dept.ranks[caste] === '-' || dept.ranks[caste] === null) && row.rank != null) {
        dept.ranks[caste] = row.rank;
      } else if (dept.ranks[caste] === undefined) {
        dept.ranks[caste] = '-';
      }

      if ((dept.seats[caste] === undefined || dept.seats[caste] === '-' || dept.seats[caste] === null) && row.total_seats_in_dept != null) {
        dept.seats[caste] = row.total_seats_in_dept;
      } else if (dept.seats[caste] === undefined) {
        dept.seats[caste] = '-';
      }

      if ((dept.seatsFilling[caste] === undefined || dept.seatsFilling[caste] === '-' || dept.seatsFilling[caste] === null) && row.seats_filling != null) {
        dept.seatsFilling[caste] = row.seats_filling;
      } else if (dept.seatsFilling[caste] === undefined) {
        dept.seatsFilling[caste] = '-';
      }
    }
  });
  Object.keys(collegeMap).forEach(code => {
    collegeMap[code].departments = Object.values(collegeMap[code].departments).sort((a, b) => {
      const an = (a.branchName || '').toString();
      const bn = (b.branchName || '').toString();
      if (an && bn) return an.localeCompare(bn);
      if (an) return -1;
      if (bn) return 1;
      return (a.code || '').toString().localeCompare((b.code || '').toString());
    });
  });
  return collegeMap;
}
// ───────────────────────────────────────────────────────────────────────────

const CollegeSearch = () => {
  const { isSubscribed } = useSubscription();
  const { user }         = useAuth();
  const navigate         = useNavigate();

  const [catalog,        setCatalog]        = useState([]);
  const [detailsByCode,  setDetailsByCode]  = useState({});
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showUnlock,     setShowUnlock]     = useState(false);
  
  // Filtering state
  const [departments,    setDepartments]    = useState([]);
  const [selectedDept,   setSelectedDept]   = useState('All');
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ── Fetch Departments ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const API_BASE = getApiBase();
        const res = await fetch(joinApi(API_BASE, '/colleges/departments'));
        if (!res.ok) throw new Error('Failed to fetch departments');
        const json = await res.json();
        setDepartments(json?.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepts();
  }, []);

  // ── Fetch college catalog (debounced + paginated; supports search) ─────────
  useEffect(() => {
    const controller = new AbortController();
    const q = searchQuery.trim();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const API_BASE = getApiBase();
        const pageSize = 2000; // backend clamps to max 2000
        let page = 1;
        let all = [];
        let total = null;

        // Pull the full catalog (or full searched catalog) so results are not missed
        // when the colleges table has > 2000 rows.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const url = new URL(joinApi(API_BASE, '/colleges/catalog'));
          url.searchParams.set('page', String(page));
          url.searchParams.set('pageSize', String(pageSize));
          if (q) url.searchParams.set('search', q);
          if (selectedDept !== 'All') url.searchParams.set('dept_id', selectedDept);

          const res = await fetch(url.toString(), { signal: controller.signal });
          if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
          const json = await res.json();
          const batch = json?.data || [];
          if (typeof json?.total === 'number') total = json.total;

          all = all.concat(batch);
          if (batch.length < pageSize) break;
          if (total !== null && all.length >= total) break;
          page += 1;
          if (page > 1000) break;
        }

        setCatalog(all);
        // keep detailsByCode cache; it will fill in as user expands
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Failed to fetch colleges catalog:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery, selectedDept]);

  // Combine catalog with loaded details (dropdown fetch is per-college)
  const directoryColleges = useMemo(() => {
    return (catalog || []).map((c) => {
      const code = c.college_code;
      const detail = detailsByCode[code];
      return {
        college_code: code,
        code,
        name: c.college_name,
        location: c.college_address || '',
        departments: detail?.departments || [],
        rawRows: detail?.rawRows || [],
        // Entrance Cutoff removed from UI
        minCutoff: '—',
      };
    });
  }, [catalog, detailsByCode]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return directoryColleges;

    const normalizedQuery = q.replace(/^0+/, '');
    const isNumeric = /^\d+$/.test(q);

    // 1. Strict Code Match (e.g., search "02" -> matches "2" exactly)
    if (isNumeric) {
      const strictMatches = directoryColleges.filter(item => {
        const itemCode = String(item.college_code || "").toLowerCase().replace(/^0+/, '');
        return itemCode === normalizedQuery;
      });
      if (strictMatches.length > 0) return strictMatches;
    }

    // 2. Broad Search (Fallback)
    return directoryColleges.filter(item => {
      const itemCode = String(item.college_code || "").toLowerCase();
      const itemName = String(item.name || "").toLowerCase();
      const itemLoc  = String(item.location || "").toLowerCase();

      const deptMatch = (item.departments || []).some((d) =>
        [String(d.branchName || ""), String(d.code || "")].some((s) => 
          s.toLowerCase().includes(q)
        )
      );
      
      return itemName.includes(q) || itemLoc.includes(q) || itemCode.includes(q) || deptMatch;
    });
  }, [searchQuery, directoryColleges]);

  // Reset to page 1 on search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pagedData  = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── View More ─────────────────────────────────────────────────────────────
  const handleViewMore = async (college) => {
    if (!isSubscribed) {
      setShowUnlock(true);
      return;
    }
    
    // Fetch details immediately before showing
    let details = await fetchCollegeDetailsIfNeeded(college);
    
    setSelectedDetail({
      ...college,
      departments: details?.departments || college.departments || [],
      rawRows: details?.rawRows || college.rawRows || []
    });
  };

  const fetchCollegeDetailsIfNeeded = async (college) => {
    const code = college?.college_code || college?.code;
    if (!code) return null;
    if (detailsByCode[code]) return detailsByCode[code];
    try {
      const API_BASE = getApiBase();
      const res = await fetch(joinApi(API_BASE, `/colleges/details/${code}`), {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!res.ok) throw new Error(`Details request failed: ${res.status}`);
      const json = await res.json();
      const rows = json?.data || [];
      const grouped = groupRawRows(rows);
      const one = grouped[code];
      if (!one) {
        const empty = { departments: [], rawRows: [], minCutoff: '—' };
        setDetailsByCode((prev) => ({ ...prev, [code]: empty }));
        return empty;
      }
      const cutoffs = (one.departments || [])
        .map((d) => {
          const v = d?.cutoffs?.OC;
          const n = typeof v === 'number' ? v : Number.parseFloat(v);
          return Number.isFinite(n) ? n : null;
        })
        .filter((n) => n !== null);
      const minCutoff = cutoffs.length ? Math.max(...cutoffs).toFixed(1) : '—';

      const finalDetails = { ...one, minCutoff };
      setDetailsByCode((prev) => ({
        ...prev,
        [code]: finalDetails,
      }));
      return finalDetails;
    } catch (e) {
      console.error('Failed to fetch college details:', e);
      return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {selectedDetail ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="flex-1 bg-slate-50 min-h-screen"
          >
            <CollegeDetailView
              item={selectedDetail}
              onClose={() => setSelectedDetail(null)}
              onSubscribe={() => navigate('/subscribe')}
            />
          </motion.div>
        ) : (
          /* ── Directory List ── */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
             className={`flex flex-col w-full ${!isSubscribed ? 'h-screen overflow-hidden' : ''}`}
          >
            {/* Full Screen Lock for Free Users */}
            {!isSubscribed && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop Blur overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[8px]" />
                
                {/* Lock Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full text-center"
                >
                  <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 animate-bounce">
                    <Lock size={40} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Premium Only</h2>
                  <p className="text-slate-500 font-medium text-lg mb-10">
                    The College Directory and advanced cutoff search are exclusive to premium members. 
                    Upgrade your account to unlock full access.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => navigate('/subscribe')}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                    >
                      Unlock All Features <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-8 md:py-12">
              <div className="max-w-[1400px] mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">College Directory</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Live TNEA cutoff data — search by name, branch or college code.</p>
                
                {/* Search Bar centered in header */}
                <div className="max-w-3xl mx-auto mt-6 md:mt-10">
                  <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
              </div>
            </div>

            <div className="flex max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 gap-8 relative">
              {/* ── Mobile Filter Toggle ── */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-200 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
              >
                <Filter size={18} />
                Filters
              </button>

              {/* ── Mobile Filter Drawer ── */}
              <AnimatePresence>
                {isMobileFilterOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden"
                    />
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[51] lg:hidden flex flex-col shadow-2xl"
                    >
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs">
                          <Filter size={16} className="text-indigo-600" />
                          Filters
                        </div>
                        <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                        <FilterContent 
                          selectedDept={selectedDept} 
                          setSelectedDept={(id) => { setSelectedDept(id); setIsMobileFilterOpen(false); }} 
                          departments={departments} 
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* ── Left Sidebar (Desktop Filter) ── */}
              <aside className="w-72 flex-shrink-0 hidden lg:block">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[11px]">
                      <Filter size={14} className="text-indigo-600" />
                      Filters
                    </div>
                    {selectedDept !== 'All' && (
                      <button 
                        onClick={() => setSelectedDept('All')}
                        className="text-indigo-600 font-bold text-[10px] uppercase hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="p-6 flex flex-col gap-6">
                    <FilterContent 
                      selectedDept={selectedDept} 
                      setSelectedDept={setSelectedDept} 
                      departments={departments} 
                    />
                  </div>
                </div>
              </aside>

              {/* ── Main Content (Results) ── */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* ── States ── */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Directory...</p>
                  </div>

                ) : filteredData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Building size={48} className="text-slate-200" />
                    <h3 className="text-lg font-black text-slate-900">No results found</h3>
                    <p className="text-slate-400 font-medium text-sm">Try a different name, branch or code.</p>
                  </div>

                ) : (
                  <>
                    {/* Meta row */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          {filteredData.length} Results
                        </p>
                        {selectedDept !== 'All' && (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight">
                            Filtered by Branch
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    {/* One card per college (no duplicates) */}
                    <div className="flex flex-col gap-4 relative">
                      {(isSubscribed ? pagedData : pagedData.slice(0, 3)).map((college) => (
                        <CollegeRow
                          key={college.college_code}
                          college={college}
                          selectedCommunity={user?.caste || 'OC'}
                          onViewProfile={handleViewMore}
                          onExpand={isSubscribed ? fetchCollegeDetailsIfNeeded : () => setShowUnlock(true)}
                        />
                      ))}

                      {!isSubscribed && pagedData.length > 3 && (
                        <div className="relative">
                          {/* Blurred placeholder cards for preview */}
                          <div className="flex flex-col gap-4 opacity-40 blur-[2px] pointer-events-none select-none">
                            {pagedData.slice(3, 5).map((college) => (
                              <CollegeRow
                                key={college.college_code}
                                college={college}
                                selectedCommunity={user?.caste || 'OC'}
                                onViewProfile={() => {}}
                                onExpand={() => {}}
                              />
                            ))}
                          </div>
                          
                          {/* Lock Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent flex flex-col items-center justify-end pb-12">
                            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 max-w-xl w-full text-center">
                              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
                                <Lock size={32} />
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 mb-2">Search is Locked</h3>
                              <p className="text-slate-500 font-medium mb-8">Upgrade to Premium to unlock all {filteredData.length} colleges and see detailed cutoff ranks.</p>
                              <button
                                onClick={() => navigate('/subscribe')}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                              >
                                Upgrade Now <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pagination controls */}
                    {isSubscribed && totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 py-6">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                            .reduce((acc, p, i, arr) => {
                              if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) =>
                              p === '...' ? (
                                <span key={`el-${i}`} className="px-2 text-slate-300 font-black text-sm select-none">…</span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => goToPage(p)}
                                  className={`w-10 h-10 rounded-xl text-[12px] font-black transition-all shadow-sm border ${
                                    p === currentPage
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {p}
                                </button>
                              )
                            )
                          }
                        </div>

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    {/* Upgrade nudge at the very bottom for pros too if needed, or removed */}
                    {/* {!isSubscribed && ( ... )} */}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-component for Shared Filter UI ──────────────────────────────────────
const FilterContent = ({ selectedDept, setSelectedDept, departments }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
      Department / Branch
    </label>
    <div className="flex flex-col gap-1.5 max-h-[500px] lg:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      <button
        onClick={() => setSelectedDept('All')}
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
          selectedDept === 'All'
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            : 'text-slate-500 hover:bg-slate-50 border border-transparent'
        }`}
      >
        All Branches
        {selectedDept === 'All' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
      </button>
      {departments.map((dept) => (
        <button
          key={dept.dept_id}
          onClick={() => setSelectedDept(dept.dept_id)}
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
            selectedDept === dept.dept_id
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              : 'text-slate-500 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <span className="truncate">{dept.dept_name}</span>
          {selectedDept === dept.dept_id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 ml-2" />}
        </button>
      ))}
    </div>
  </div>
);

export default CollegeSearch;
