import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { token, isLoading } = useContext(AdminAuthContext);

  if (isLoading) {
    return (
      <div className="flex bg-background justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
