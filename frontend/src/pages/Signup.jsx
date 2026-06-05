import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [organization, setOrganization] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill realistic coordinates depending on role addresses for seamless spatial tests
  const getCoordinatesForRole = () => {
    switch (role) {
      case 'farmer':
        return { latitude: 19.0760, longitude: 72.8777, address: address || 'Mumbai Farm Hub' }; // Mumbai coordinates
      case 'buyer':
        return { latitude: 19.0820, longitude: 72.8820, address: address || 'Grand Regency Catering, Mumbai' };
      case 'animal_care':
        return { latitude: 19.0900, longitude: 72.8900, address: address || 'Compassion Cow Sanctuary, Mumbai' };
      case 'compost':
        return { latitude: 19.0950, longitude: 72.9000, address: address || 'Navi Soil Composting Yard' };
      default:
        return { latitude: 20.5937, longitude: 78.9629, address: address || 'India' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const coords = getCoordinatesForRole();
    const signupData = {
      name,
      email,
      password,
      role,
      phone,
      organization,
      location: coords
    };

    const result = await signup(signupData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const rolesList = [
    { value: 'farmer', emoji: '🌾', label: 'Farmer' },
    { value: 'buyer', emoji: '🏨', label: 'Commercial Buyer' },
    { value: 'animal_care', emoji: '🐄', label: 'Animal Care' },
    { value: 'compost', emoji: '♻️', label: 'Compost Processor' }
  ];

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-brand-cream/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white border border-brand-sand shadow-premium p-8 rounded-3xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="font-display font-extrabold text-3xl text-brand-earth">Join KrishiSamadhan</h2>
          <p className="text-gray-500 text-sm font-accent">Connect, rescue crops, and earn sustainability points</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-2.5">
              Choose your Account Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rolesList.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 hover:bg-brand-clay/35 ${
                    role === r.value 
                      ? 'border-brand-emerald bg-brand-sage/20 text-brand-earth font-extrabold' 
                      : 'border-brand-sand bg-white text-gray-500'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-xs">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="e.g. user@samadhan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Password</label>
              <input 
                type="password" 
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Phone Number</label>
              <input 
                type="text" 
                required
                placeholder="10 digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Organization / Farm Name</label>
              <input 
                type="text" 
                placeholder="e.g. Kumar Organic Farms"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Location / Address</label>
              <input 
                type="text" 
                required
                placeholder="City, State, Zip"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3.5 flex items-center justify-center font-display font-semibold"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>

        </form>

        <p className="text-center text-xs text-gray-500 font-accent">
          Already registered? <Link to="/login" className="font-bold text-brand-emerald hover:underline">Log in</Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Signup;
