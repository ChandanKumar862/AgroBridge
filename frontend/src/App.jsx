import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Impact from './pages/Impact';
import Marketplace from './pages/Marketplace';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Workspace pages
import UploadProduce from './pages/UploadProduce';
import Messages from './pages/Messages';
import FarmerListings from './pages/FarmerListings';

// Dashboards
import FarmerDashboard from './pages/Dashboards/FarmerDashboard';
import BuyerDashboard from './pages/Dashboards/BuyerDashboard';
import SecondaryDashboard from './pages/Dashboards/SecondaryDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

// Secure Route Guardian
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-brand-cream/30">
        <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-brand-cream/10 selection:bg-brand-emerald selection:text-white">
          
          {/* Glassmorphic Navbar */}
          <Navbar />
          
          {/* Main Routing Terminal */}
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/marketplace" element={<Marketplace />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Secure Operational Workspace Routes */}
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <UploadProduce />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/farmer-listings" 
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />

              {/* Secure Dashboards */}
              <Route 
                path="/dashboard/farmer" 
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/buyer" 
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/animal-care" 
                element={
                  <ProtectedRoute allowedRoles={['animal_care']}>
                    <SecondaryDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/compost" 
                element={
                  <ProtectedRoute allowedRoles={['compost']}>
                    <SecondaryDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Catch Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Minimalist Eco Footer */}
          <footer className="bg-brand-earth text-gray-300 py-10 border-t border-brand-sand/10 text-xs shrink-0">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-3 font-accent">
              <p className="font-semibold text-white">
                🌱 AgroBridge — Building a Zero-Food-Waste Agriculture Economy.
              </p>
              <p className="text-gray-400">
                AI grading algorithms matching imperfect crops to Hotels, Animal Care Shelters, and Composting Yards.
              </p>
              <p className="text-[10px] text-gray-500">
                © 2026 AgroBridge. Powered by Google Gemini. All rights reserved.
              </p>
            </div>
          </footer>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
