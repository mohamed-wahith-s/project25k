import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ApiContext, API_BASE_URL } from './context/ApiContext';
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
import EligibleColleges from './pages/EligibleColleges';
// import TNEADashboard from './pages/TNEADashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
  
  // Unauthenticated: redirect to home, passing the intended path so Navbar can send them to login
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />;
  
  return children;
};

const App = () => {
  return (
    <ApiContext.Provider value={API_BASE_URL}>
    <AuthProvider>
      <SubscriptionProvider>
        <CollegeProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100">
              <Navbar />
              <main className="flex-1 pb-20 md:pb-0">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Public home route — works for guests and logged-in users */}
                <Route path="/" element={<Dashboard />} />
                
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

                <Route path="/eligible-colleges" element={
                  <ProtectedRoute>
                    <EligibleColleges />
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
    </ApiContext.Provider>
  );
};

export default App;
