import React, { useEffect, useContext } from 'react';
import { CollegeContext } from '../context/CollegeContext';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const CollegesPage = () => {
  const { colleges, fetchColleges, isLoading, error } = useContext(CollegeContext);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const columns = [
    {
      key: 'college_code',
      label: 'Code',
      render: (val) => (
        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {val}
        </span>
      )
    },
    {
      key: 'college_name',
      label: 'College Name',
      render: (val) => (
        <span className="font-semibold text-primary">{val}</span>
      )
    },
    { key: 'college_address', label: 'Address' },
  ];

  if (isLoading && colleges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Colleges Directory
            </h1>
          </div>
          <p className="text-sm text-text-secondary font-medium pl-10 sm:pl-0">
            All participating technical institutions and their details.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-10 sm:pl-0">
          <div className="bg-primary/5 border border-primary/15 text-primary text-xs font-bold px-3 py-2 rounded-lg">
            {colleges.length} colleges
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <DataTable columns={columns} data={colleges} />
      )}
    </motion.div>
  );
};

export default CollegesPage;
