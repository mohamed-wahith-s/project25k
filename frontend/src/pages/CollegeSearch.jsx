import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight } from 'lucide-react';
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
    return directoryColleges.filter(item => {
      const deptMatch = (item.departments || []).some((d) =>
        [d.branchName, d.code].some((s) => s?.toLowerCase().includes(q))
      );
      return (
        [item.name, item.location, item.college_code].some((s) => s?.toLowerCase().includes(q)) ||
        deptMatch
      );
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
  const handleViewMore = (college) => {
    setSelectedDetail(college);
  };

  const fetchCollegeDetailsIfNeeded = async (college) => {
    const code = college?.college_code || college?.code;
    if (!code) return;
    if (detailsByCode[code]) return;
    try {
      const API_BASE = getApiBase();
      const res = await fetch(joinApi(API_BASE, `/colleges/details/${code}`));
      if (!res.ok) throw new Error(`Details request failed: ${res.status}`);
      const json = await res.json();
      const rows = json?.data || [];
      const grouped = groupRawRows(rows);
      const one = grouped[code];
      if (!one) {
        setDetailsByCode((prev) => ({ ...prev, [code]: { departments: [], rawRows: [], minCutoff: '—' } }));
        return;
      }
      const cutoffs = (one.departments || [])
        .map((d) => {
          const v = d?.cutoffs?.OC;
          const n = typeof v === 'number' ? v : Number.parseFloat(v);
          return Number.isFinite(n) ? n : null;
        })
        .filter((n) => n !== null);
      const minCutoff = cutoffs.length ? Math.max(...cutoffs).toFixed(1) : '—';

      setDetailsByCode((prev) => ({
        ...prev,
        [code]: { ...one, minCutoff },
      }));
    } catch (e) {
      console.error('Failed to fetch college details:', e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-700 overflow-x-hidden">
      <AnimatePresence mode="wait">

        {/* ── Detail View ── */}
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col px-8 py-8 gap-6 max-w-[1200px] mx-auto w-full"
          >
            {/* Page Header */}
            <div className="text-center pt-4 pb-2">
              <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">College Directory</h1>
              <p className="text-slate-500 font-medium">Live TNEA cutoff data — search by name, branch or college code.</p>
            </div>

            {/* Search Bar */}
            <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* ── States ── */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Directory...</p>
              </div>

            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Building size={48} className="text-slate-200" />
                <h3 className="text-lg font-black text-slate-900">No results found</h3>
                <p className="text-slate-400 font-medium text-sm">Try a different name, branch or code.</p>
              </div>

            ) : (
              <>
                {/* Meta row */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {filteredData.length} Results
                  </p>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>

                {/* One card per college (no duplicates) */}
                <div className="flex flex-col gap-4">
                  {pagedData.map((college) => (
                    <CollegeRow
                      key={college.college_code}
                      college={college}
                      selectedCommunity={user?.caste || 'OC'}
                      onViewProfile={handleViewMore}
                      onExpand={fetchCollegeDetailsIfNeeded}
                    />
                  ))}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
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

                {/* Upgrade nudge */}
                {!isSubscribed && (
                  <div className="pb-10">
                    {!showUnlock ? (
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowUnlock(true)}
                          className="bg-white border border-slate-200 px-10 py-4 rounded-[2rem] text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3"
                        >
                          Unlock Full Access
                          <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.span>
                        </button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <UnlockProCard onUpgrade={() => navigate('/subscribe')} />
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollegeSearch;
