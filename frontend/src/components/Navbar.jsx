import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Leaf, User, LogOut, Wallet, MessageSquare, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'farmer': return '/dashboard/farmer';
      case 'buyer': return '/dashboard/buyer';
      case 'animal_care': return '/dashboard/animal-care';
      case 'compost': return '/dashboard/compost';
      case 'admin': return '/dashboard/admin';
      default: return '/';
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user?.role === 'farmer'
    ? [
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'My Crop Yields', path: '/farmer-listings' },
        { name: 'Sustainability Impact', path: '/impact' },
        { name: 'About & Vision', path: '/about' },
      ]
    : [
        { name: 'Marketplace', path: '/marketplace' },
        { name: 'Sustainability Impact', path: '/impact' },
        { name: 'About & Vision', path: '/about' },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-brand-sand shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-brand-earth flex items-center justify-center text-white transition-transform group-hover:rotate-12 duration-300">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-brand-earth block">
                  KrishiSamadhan
                </span>
                <span className="text-[10px] tracking-wider text-brand-emerald font-accent font-bold uppercase block -mt-1">
                  Zero-Waste Agriculture
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-brand-earth border-b-2 border-brand-mint pb-1 font-bold'
                    : 'text-gray-600 hover:text-brand-earth'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth / User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                
                {/* Wallet Balance for Buyers/Farmers */}
                {(user.role === 'buyer' || user.role === 'farmer') && (
                  <div className="flex items-center gap-2 bg-brand-clay/40 py-1.5 px-3 rounded-full border border-brand-sand text-brand-earth font-accent text-sm font-semibold">
                    <Wallet className="w-4 h-4 text-brand-emerald" />
                    <span>₹{user.balance?.toFixed(2)}</span>
                  </div>
                )}

                {/* Direct Messages Link */}
                <Link 
                  to="/messages" 
                  title="Direct Chats"
                  className="p-2 rounded-xl bg-white border border-brand-sand hover:bg-brand-clay/20 text-gray-600 hover:text-brand-earth transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardLink()}
                  className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 font-display"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Log Out */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-brand-earth font-medium px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brand-earth hover:bg-brand-earth/95 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg font-display"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-brand-earth bg-brand-clay/30 hover:bg-brand-clay/50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-sand py-4 px-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-xl font-medium ${
                isActive(link.path)
                  ? 'bg-brand-clay/50 text-brand-earth font-bold'
                  : 'text-gray-600 hover:bg-brand-clay/30 hover:text-brand-earth'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <hr className="border-brand-sand" />

          {user ? (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center px-3">
                <span className="text-sm font-semibold text-gray-500">Wallet Balance:</span>
                <span className="font-accent font-bold text-brand-earth">₹{user.balance?.toFixed(2)}</span>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>
              <Link
                to="/messages"
                onClick={() => setIsOpen(false)}
                className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inbox</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2 border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="py-3 text-center text-gray-600 hover:bg-brand-clay/30 rounded-xl font-medium border border-brand-sand"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="py-3 text-center bg-brand-earth text-white rounded-xl font-medium shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
