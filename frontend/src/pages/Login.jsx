import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-brand-cream/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-brand-sand shadow-premium p-8 rounded-3xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="font-display font-extrabold text-3xl text-brand-earth">Welcome Back</h2>
          <p className="text-gray-500 text-sm font-accent">Access your AgroBridge agricultural account</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. farmer@krishi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-brand-emerald hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
            />
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
                <LogIn className="w-5 h-5" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 font-accent">
          Don't have an account? <Link to="/signup" className="font-bold text-brand-emerald hover:underline">Register now</Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
