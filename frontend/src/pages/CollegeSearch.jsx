import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Filter, Search, X, Menu, Lock, Unlock } from 'lucide-react';
import CollegeRow from '../components/CollegeRow';
import UnlockProCard from '../components/UnlockProCard';
import SearchHeader from '../components/search/SearchHeader';
import CollegeDetailView from '../components/search/CollegeDetailView';
import { useApiBase } from '../context/ApiContext';

const PAGE_SIZE = 20;

// ─── Free College Whitelist ────────────────────────────────────────────────
// These colleges are shown in full to ALL users, including those without
// a premium subscription. Keep in sync with backend FREE_COLLEGE_CODES.
const FREE_COLLEGE_CODES = new Set([
  '1', '4', '2005', '2006', '2007',
  '5008', '1414', '2712', '1399', '2718',
]);


const normaliseCode = (code) => String(code || '').replace(/^0+/, '') || String(code || '');
const isFreeCollege = (code) => FREE_COLLEGE_CODES.has(normaliseCode(code));

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
  const API_BASE         = useApiBase();

  const [catalog,        setCatalog]        = useState([]);
  const [detailsByCode,  setDetailsByCode]  = useState({});
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showUnlock,     setShowUnlock]     = useState(false);
  
  // Filtering state removed


  // ── Fetch college catalog (debounced + paginated; supports search) ─────────
  useEffect(() => {
    const controller = new AbortController();
    const q = searchQuery.trim();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const pageSize = 2000; // backend clamps to max 2000
        let page = 1;
        let all = [];
        let total = null;

        // Pull the full catalog (or full searched catalog) so results are not missed
        // when the colleges table has > 2000 rows.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const url = new URL(`${API_BASE}/colleges/catalog`);
          url.searchParams.set('page', String(page));
          url.searchParams.set('pageSize', String(pageSize));
          if (q) url.searchParams.set('search', q);

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
  }, [searchQuery]);

  // Combine catalog with loaded details (dropdown fetch is per-college)
  const directoryColleges = useMemo(() => {
    const list = (catalog || []).map((c) => {
      const code = c.college_code;
      const detail = detailsByCode[code];
      const isFree = isFreeCollege(code);
      
      // Filter departments if details are loaded
      let departments = detail?.departments || [];

      return {
        college_code: code,
        code,
        name: c.college_name,
        location: c.college_address || '',
        departments,
        rawRows: detail?.rawRows || [],
        isFree,
        minCutoff: '—',
      };
    });

    // Prioritize free colleges at the top
    return [...list].sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return 0;
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

  // Reset to page 1 on filter/search change
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
    const code = college?.college_code || college?.code;
    const canAccess = isSubscribed || isFreeCollege(code);

    if (!canAccess) {
      setShowUnlock(true);
      return;
    }
    
    // Fetch details immediately before showing
    let details = await fetchCollegeDetailsIfNeeded(college);
    
    setSelectedDetail({
      ...college,
      isFree: isFreeCollege(code),
      departments: details?.departments || college.departments || [],
      rawRows: details?.rawRows || college.rawRows || []
    });
  };

  const fetchCollegeDetailsIfNeeded = async (college) => {
    const code = college?.college_code || college?.code;
    if (!code) return null;
    if (detailsByCode[code]) return detailsByCode[code];
    try {
      const headers = {};
      if (user?.token && user.token !== 'undefined') {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const res = await fetch(`${API_BASE}/colleges/details/${code}`, {
        headers
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
              selectedCaste={'All'}
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
           className={`flex flex-col w-full`}
          >
            {/* No full-screen lock — free colleges are visible to all users */}
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

            <div className="flex max-w-[1000px] mx-auto w-full px-4 md:px-8 py-6 md:py-10 justify-center relative">

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
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    {/* One card per college (no duplicates) */}
                    <div className="flex flex-col gap-4 relative">
                      {pagedData.map((college, idx) => {
                        const canExpand = isSubscribed || college.isFree;
                        const isLocked = !isSubscribed && !college.isFree && idx >= 3;
                        
                        if (isLocked) return null; // We'll show the lock overlay after the 3rd paid college

                        return (
                          <React.Fragment key={college.college_code}>
                            {/* Section header for Free vs Paid if needed, or just the rows */}
                            {idx === 0 && college.isFree && (
                              <div className="flex items-center gap-2 mb-2 px-1">
                                <Unlock size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Featured Free Colleges</span>
                              </div>
                            )}
                            {idx > 0 && college.isFree && !pagedData[idx-1].isFree && (
                               <div className="h-px bg-slate-200 my-4" />
                            )}
                            <CollegeRow
                              college={college}
                              selectedCommunity={'OC'}
                              onViewProfile={handleViewMore}
                              onExpand={canExpand ? fetchCollegeDetailsIfNeeded : () => setShowUnlock(true)}
                            />
                          </React.Fragment>
                        );
                      })}

                      {!isSubscribed && filteredData.some(c => !c.isFree) && (
                        <div className="relative mt-4">
                          {/* Blurred placeholder cards for preview */}
                          <div className="flex flex-col gap-4 opacity-40 blur-[2px] pointer-events-none select-none">
                             <CollegeRow
                                college={filteredData.find(c => !c.isFree) || pagedData[0]}
                                selectedCommunity="OC"
                                onViewProfile={() => {}}
                                onExpand={() => {}}
                              />
                          </div>
                          
                          {/* Lock Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent flex flex-col items-center justify-end pb-12">
                            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 max-w-xl w-full text-center">
                              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
                                <Lock size={32} />
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 mb-2">More Colleges Locked</h3>
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

      {/* ── Unlock Pro Modal ── */}
      <AnimatePresence>
        {showUnlock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnlock(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <UnlockProCard onClose={() => setShowUnlock(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};



export default CollegeSearch;
