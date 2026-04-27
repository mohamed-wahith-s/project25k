import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataTable = ({ columns, data, searchable = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = React.useMemo(() => {
    if (!searchable || !searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable]);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  return (
    <div className="bg-surface rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-border overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-background px-3 py-2 rounded-lg border border-border">
              <SlidersHorizontal size={13} />
              <span>
                <span className="text-primary font-bold">{sortedData.length}</span>{' '}
                of {data.length} records
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-5 py-3.5 text-left text-xs font-extrabold text-text-secondary uppercase tracking-wider whitespace-nowrap select-none ${
                    column.sortable !== false
                      ? 'cursor-pointer hover:bg-border/60 hover:text-text-primary transition-colors'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {column.label}
                    {column.sortable !== false && (
                      <span className={`transition-colors ${sortConfig.key === column.key ? 'text-primary' : 'text-gray-300'}`}>
                        {sortConfig.key === column.key && sortConfig.direction === 'desc' ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronUp size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border/60">
            <AnimatePresence>
              {sortedData.length > 0 ? (
                sortedData.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.5), ease: 'easeOut' }}
                    className="hover:bg-primary/[0.03] transition-colors duration-150 group"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-5 py-4 whitespace-nowrap text-sm text-text-primary font-medium"
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key] ?? '—'}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Search size={24} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-text-secondary">No records found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-border/60">
        <AnimatePresence>
          {sortedData.length > 0 ? (
            sortedData.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.5) }}
                className="p-4 hover:bg-primary/[0.03] transition-colors"
              >
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {columns.map((column) => {
                    const value = column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? '—';
                    return (
                      <div key={column.key} className="col-span-1">
                        <dt className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider mb-0.5">
                          {column.label}
                        </dt>
                        <dd className="text-sm font-medium text-text-primary truncate">{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </motion.div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No records found</p>
              <p className="text-xs text-gray-400">Try adjusting your search term</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DataTable;
