import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, MailCheck, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

const Signup = () => {
  const { signup, sendOTP } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [organization, setOrganization] = useState('');

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Pre-fill realistic coordinates depending on role addresses for seamless spatial tests
  const getCoordinatesForRole = () => {
    switch (role) {
      case 'farmer':
        return { latitude: 19.0760, longitude: 72.8777, address: address || 'Mumbai Farm Hub' };
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

  // Step 1: Send OTP to user's email
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address (e.g. name@domain.com)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    // Call backend to send 6-digit OTP
    const res = await sendOTP(email);
    setLoading(false);

    if (res.success) {
      setOtpStep(true);
      setResendCountdown(60); // 60s cooldown
    } else {
      setError(res.message);
    }
  };

  // Step 2: Verify OTP and finalize account registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email');
      return;
    }

    setOtpLoading(true);

    const coords = getCoordinatesForRole();
    const signupData = {
      name,
      email: email.trim().toLowerCase(),
      password,
      role,
      phone,
      organization,
      location: coords,
      otp: otp.trim()
    };

    const result = await signup(signupData);
    setOtpLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  // Resend OTP code
  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setError('');
    setOtpLoading(true);

    const res = await sendOTP(email);
    setOtpLoading(false);

    if (res.success) {
      setResendCountdown(60);
    } else {
      setError(res.message);
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
        <AnimatePresence mode="wait">
          {!otpStep ? (
            // ==================== STEP 1: REGISTRATION FORM ====================
            <motion.div
              key="step-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="font-display font-extrabold text-3xl text-brand-earth">Join AgroBridge</h2>
                <p className="text-gray-500 text-sm font-accent">Connect, rescue crops, and earn sustainability points</p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleInitiateSignup} className="space-y-6">
                
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
                            ? 'border-brand-emerald bg-brand-sage/20 text-brand-earth font-extrabold shadow-sm' 
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
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-display font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verify Email & Create Account</span>
                    </>
                  )}
                </button>

              </form>

              <p className="text-center text-xs text-gray-500 font-accent">
                Already registered? <Link to="/login" className="font-bold text-brand-emerald hover:underline">Log in</Link>
              </p>
            </motion.div>
          ) : (
            // ==================== STEP 2: OTP VERIFICATION ====================
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <button 
                type="button"
                onClick={() => { setOtpStep(false); setError(''); }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-emerald transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change registration details</span>
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mx-auto mb-3">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h2 className="font-display font-extrabold text-2xl text-brand-earth">Check Your Email</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto font-accent">
                  We've sent a 6-digit verification code to <span className="font-bold text-brand-earth">{email}</span>. Please check your inbox or spam folder.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div>
                  <label className="block text-center text-xs font-bold text-gray-500 uppercase font-accent mb-2">
                    Enter 6-Digit Code
                  </label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full tracking-[0.5em] text-center font-mono font-extrabold text-2xl py-3.5 bg-brand-cream border border-brand-sand rounded-2xl focus:outline-none focus:border-brand-emerald"
                  />
                  <p className="text-center text-[11px] text-gray-400 mt-2 font-accent">Code expires in 10 minutes</p>
                </div>

                <button 
                  type="submit" 
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-display font-semibold disabled:opacity-50"
                >
                  {otpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Confirm & Register</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0 || otpLoading}
                  className="text-xs font-bold text-brand-emerald hover:underline disabled:text-gray-400 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${otpLoading ? 'animate-spin' : ''}`} />
                  {resendCountdown > 0 ? (
                    <span>Resend code in {resendCountdown}s</span>
                  ) : (
                    <span>Didn't receive code? Resend</span>
                  )}
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default Signup;
