import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';

// Route-level Code Splitting (Lazy Loading)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Impact = lazy(() => import('./pages/Impact'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UploadProduce = lazy(() => import('./pages/UploadProduce'));
const Messages = lazy(() => import('./pages/Messages'));
const FarmerListings = lazy(() => import('./pages/FarmerListings'));
const FarmerDashboard = lazy(() => import('./pages/Dashboards/FarmerDashboard'));
const BuyerDashboard = lazy(() => import('./pages/Dashboards/BuyerDashboard'));
const SecondaryDashboard = lazy(() => import('./pages/Dashboards/SecondaryDashboard'));
const AdminDashboard = lazy(() => import('./pages/Dashboards/AdminDashboard'));

// Accessible Page Loading Fallback
const PageLoadingFallback = () => (
  <div className="flex-grow flex items-center justify-center py-24 bg-brand-cream/10">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-brand-forest/60">Loading view...</span>
    </div>
  </div>
);

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
            <Suspense fallback={<PageLoadingFallback />}>
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
            </Suspense>
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
