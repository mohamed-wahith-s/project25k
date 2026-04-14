import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight } from 'lucide-react';
import TNEAResultRow from '../components/TNEAResultRow';
import UnlockProCard from '../components/UnlockProCard';
import SearchHeader from '../components/search/SearchHeader';
import TNEATableHeader from '../components/search/TNEATableHeader';
import CollegeDetailView from '../components/search/CollegeDetailView';

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

    const deptId = row.dept_id;
    if (!collegeMap[code].departments[deptId]) {
      collegeMap[code].departments[deptId] = {
        branchName: row.departments?.dept_name || '',
        code: row.departments?.subject_code || row.subject_code || '',
        cutoffs: {},
        seats: {},
      };
    }
    const caste = row.caste_category;
    if (caste) {
      collegeMap[code].departments[deptId].cutoffs[caste] = row.cutoff_mark ?? '-';
      collegeMap[code].departments[deptId].seats[caste]   = row.total_seats_in_dept ?? '-';
    }
  });
  Object.keys(collegeMap).forEach(code => {
    collegeMap[code].departments = Object.values(collegeMap[code].departments);
  });
  return collegeMap;
}
// ───────────────────────────────────────────────────────────────────────────

const CollegeSearch = () => {
  const { isSubscribed } = useSubscription();
  const { user }         = useAuth();
  const navigate         = useNavigate();

  const [rawRows,        setRawRows]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showUnlock,     setShowUnlock]     = useState(false);

  // ── Fetch live data from backend ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res  = await fetch(`${API_URL}/colleges`);
        const json = await res.json();
        setRawRows(json.data || []);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derive structured college map & flat directory rows ───────────────────
  const collegeMap = useMemo(() => groupRawRows(rawRows), [rawRows]);

  const directoryRows = useMemo(() => {
    const rows = [];
    Object.values(collegeMap).forEach(college => {
      college.departments.forEach(dept => {
        rows.push({ ...college, dept });
      });
    });
    return rows;
  }, [collegeMap]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return directoryRows;
    return directoryRows.filter(item =>
      [item.name, item.location, item.dept?.branchName, item.college_code]
        .some(s => s?.toLowerCase().includes(q))
    );
  }, [searchQuery, directoryRows]);

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
  const handleViewMore = (item) => {
    const college = collegeMap[item.college_code];
    setSelectedDetail(college || item);
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

                {/* Table */}
                <TNEATableHeader />
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {pagedData.map((item, idx) => (
                    <TNEAResultRow
                      key={`${item.college_code}-${item.dept?.code}-${idx}`}
                      college={item}
                      dept={item.dept}
                      onClick={() => handleViewMore(item)}
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
