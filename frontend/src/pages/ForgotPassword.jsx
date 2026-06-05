import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { api } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1 = request, 2 = verify
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setCode(res.data.resetCode); // Pre-fill code for developer speed testing
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { 
        email, 
        password: newPassword, 
        code 
      });
      if (res.data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code or password parameters.');
    } finally {
      setLoading(false);
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
          <h2 className="font-display font-extrabold text-3xl text-brand-earth">Reset Password</h2>
          <p className="text-gray-500 text-sm font-accent">Recover your account credentials</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Registered Email Address</label>
              <input 
                type="email" 
                required
                placeholder="e.g. farmer@krishi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <KeyRound className="w-5 h-5" />
                  <span>Send Recovery Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Verification Code</label>
              <input 
                type="text" 
                required
                placeholder="Reset code from screen/email"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald font-mono uppercase tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">New Password</label>
              <input 
                type="password" 
                required
                placeholder="Enter minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        <hr className="border-brand-sand" />

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-brand-emerald hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
