import React, { useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const UsersPage = () => {
  const { users, fetchUsers, isLoading, error } = useContext(UserContext);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'father_name', label: "Father's Name" },
    { key: 'email', label: 'Email' },
    { key: 'mobile_number', label: 'Mobile' },
    { key: 'alternative_mobile', label: 'Alt Mobile' },
    {
      key: 'date_of_birth',
      label: 'DOB',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '—'
    },
    { key: 'address', label: 'Address' },
    {
      key: 'caste_category',
      label: 'Category',
      render: (val) => val ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          {val}
        </span>
      ) : '—'
    },
    { key: 'board_of_study', label: 'Board' },
    { key: 'exam_roll_no', label: 'Roll No.' },
    { key: 'physics_mark', label: 'Physics' },
    { key: 'chemistry_mark', label: 'Chemistry' },
    { key: 'maths_mark', label: 'Maths' },
    { key: 'tnea_ranking', label: 'Rank', render: (val) => val || 'N/A' },
    {
      key: 'is_paid',
      label: 'Payment',
      sortable: false,
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            val
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-green-500' : 'bg-amber-500'}`} />
          {val ? 'Paid' : 'Pending'}
        </span>
      )
    },
    {
      key: 'last_paid_date',
      label: 'Paid On',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '—'
    },
    {
      key: 'created_at',
      label: 'Applied On',
      render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '—'
    }
  ];

  if (isLoading && users.length === 0) {
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
              <Users size={16} className="text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Registered Users
            </h1>
          </div>
          <p className="text-sm text-text-secondary font-medium pl-10 sm:pl-0">
            View and manage all student application details.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-10 sm:pl-0">
          <div className="bg-primary/5 border border-primary/15 text-primary text-xs font-bold px-3 py-2 rounded-lg">
            {users.length} total
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </motion.div>
  );
};

export default UsersPage;
