import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { UserProvider } from '../context/UserContext';
import { CollegeProvider } from '../context/CollegeContext';

const DashboardPage = () => {
  return (
    <UserProvider>
      <CollegeProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </CollegeProvider>
    </UserProvider>
  );
};

export default DashboardPage;
