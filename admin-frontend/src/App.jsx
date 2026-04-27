import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CollegesPage from './pages/CollegesPage';
import AdminProfilePage from './pages/AdminProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardPage />}>
            <Route index element={<Navigate to="/dashboard/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="colleges" element={<CollegesPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
