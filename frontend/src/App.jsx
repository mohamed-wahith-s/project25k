import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionProvider';
import { CollegeProvider } from './context/CollegeProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingCallButton from './components/FloatingCallButton';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import CollegeSearch from './pages/CollegeSearch';
// import TNEADashboard from './pages/TNEADashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <CollegeProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100">
              <Navbar />
              <main className="flex-1">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/subscribe" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                <Route path="/search" element={
                  <ProtectedRoute>
                    <CollegeSearch />
                  </ProtectedRoute>
                } />

{/* 
                <Route path="/tnea" element={
                  <ProtectedRoute>
                    <TNEADashboard />
                  </ProtectedRoute>
                } /> 
                */}
              </Routes>
            </main>
            <Footer />
            <FloatingCallButton />
          </div>
          </Router>
        </CollegeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default App;
