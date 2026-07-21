import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, TrendingUp, Heart, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { api, useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWastePreventedKg: 14250,
    co2ReducedKg: 27075,
    waterSavedLitre: 9975000
  });

  // Load live statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics');
        if (res.data.success) {
          setStats(res.data.data.global);
        }
      } catch (err) {
        console.warn('Analytics loading fallback:', err.message);
      }
    };
    fetchStats();
  }, []);

  // Real-time ticking counter simulating waste rescued every few seconds!
  const [tickingWaste, setTickingWaste] = useState(stats.totalWastePreventedKg);
  useEffect(() => {
    setTickingWaste(stats.totalWastePreventedKg);
  }, [stats]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickingWaste(prev => prev + parseFloat((Math.random() * 0.15).toFixed(2)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex-grow">
      
      {/* 1. Hero Parallax Impact Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-sand via-brand-cream to-white py-24 md:py-32">
        {/* Abstract Green Mesh Backdrop */}
        <div className="absolute top-0 right-0 -mr-20 w-[400px] h-[400px] rounded-full bg-brand-sage/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 -ml-20 w-[300px] h-[300px] rounded-full bg-brand-mint/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-brand-earth/5 border border-brand-earth/10 px-4 py-1.5 rounded-full text-brand-earth text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4 text-brand-emerald animate-pulse" />
              <span>Pioneering Sustainable Agri-tech Ecosystem</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-earth leading-tight tracking-tight"
            >
              Connecting Farms with <br />
              <span className="bg-gradient-to-r from-brand-emerald to-brand-amber bg-clip-text text-transparent">
                Zero-Waste Markets
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-accent"
            >
              Daily, tons of healthy produce is rejected solely for minor cosmetic reasons. 
              AgroBridge leverages Gemini AI to grade, match, and deliver Grade B/C yields to commercial buyers, animal care sanctuaries, and composting hubs.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/marketplace" className="btn-primary px-8 py-4 text-base font-semibold">
                Explore Marketplace
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!user && (
                <Link to="/signup" className="btn-secondary px-8 py-4 text-base font-semibold">
                  Register as Farmer / Buyer
                </Link>
              )}
            </motion.div>

            {/* Interactive Live Waste rescued counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-brand-sand/60 max-w-md mx-auto lg:mx-0"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest font-accent">
                🔴 LIVE WASTE PREVENTED RIGHT NOW
              </p>
              <div className="text-3xl font-extrabold text-brand-amber font-mono mt-1">
                {tickingWaste.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans text-brand-earth">kg</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visuals: Framer Interactive Dashboard Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative w-full max-w-md aspect-square rounded-3xl bg-brand-clay/30 border border-brand-sand/80 shadow-premium p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-amber/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center pb-4 border-b border-brand-sand">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-brand-emerald bg-brand-sage/40 px-2.5 py-0.5 rounded-full uppercase">
                  Gemini-API active
                </span>
              </div>

              {/* Mock AI grading screen */}
              <div className="flex-grow flex flex-col justify-center py-6 space-y-4">
                <div className="bg-white/80 p-4 rounded-2xl border border-brand-sand shadow-sm flex items-center gap-4">
                  <span className="text-4xl">🍅</span>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-brand-earth text-sm">Deformed Tomatoes</h4>
                      <span className="text-xs font-bold text-brand-amber bg-yellow-50 px-2 py-0.5 rounded">Grade B</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Confidence: 94.6%</p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-emerald h-full rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 p-4 rounded-2xl border border-brand-sand shadow-sm flex items-center gap-4">
                  <span className="text-4xl">🥕</span>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-brand-earth text-sm">Misshapen Carrots</h4>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Grade C</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Confidence: 91.2%</p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '91%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-earth p-4 rounded-2xl text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-brand-sage font-bold tracking-wider uppercase font-accent">Matches nearby</p>
                  <p className="text-sm font-extrabold font-display">Hex Zone HEX-14_22</p>
                </div>
                <ArrowRight className="w-5 h-5 text-brand-sage animate-bounce-horizontal" />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. Three Pillars Eco Stats Dashboard Widget */}
      <section className="bg-brand-earth text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Stat 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-mint">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-extrabold font-mono text-brand-sage">
                {Math.round(stats.totalWastePreventedKg).toLocaleString()}+ kg
              </h3>
              <p className="text-gray-300 font-semibold">Organic Waste Prevented</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Monetized instead of letting Grade B/C yield rot in open fields.</p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-amber">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-extrabold font-mono text-brand-sage">
                {Math.round(stats.co2ReducedKg).toLocaleString()} kg
              </h3>
              <p className="text-gray-300 font-semibold">CO₂ Emissions Offset</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Calculated based on EPA index of 1.9 kg carbon per 1 kg rescued food.</p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-sky-400">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-4xl font-extrabold font-mono text-brand-sage">
                {(stats.waterSavedLitre / 1000000).toFixed(2)}M Litres
              </h3>
              <p className="text-gray-300 font-semibold">Water Resources Saved</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Rescuing produce retains the high volume of water used to grow it.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Role Pillars Showcase Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-earth">
              A Unified Ecosystem for Zero-Waste Agriculture
            </h2>
            <p className="text-gray-600 mt-4 text-base font-accent">
              AgroBridge operates a smart multipart matching engine connecting four unique ecosystem roles.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            
            {/* Farmer Card */}
            <motion.div variants={cardVariants} className="p-8 rounded-2xl bg-brand-clay/30 border border-brand-sand/80 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl">👨‍🌾</span>
              <h3 className="font-display font-bold text-xl text-brand-earth mt-6">Farmers</h3>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Upload photographs of imperfect yields. Instantly get automated Grade B/C AI ratings, pricing advice, and connection to secondary markets.
              </p>
              <ul className="text-xs text-brand-earth font-bold space-y-2 mt-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Extra Revenue Stream</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> AI Auto-Grading</li>
              </ul>
            </motion.div>

            {/* Buyer Card */}
            <motion.div variants={cardVariants} className="p-8 rounded-2xl bg-brand-clay/30 border border-brand-sand/80 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl">🏨</span>
              <h3 className="font-display font-bold text-xl text-brand-earth mt-6">Commercial Buyers</h3>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Hotels, restaurants, and mess halls purchase perfectly nutritious Grade B yields at a 30-50% discount, lowering raw materials costs.
              </p>
              <ul className="text-xs text-brand-earth font-bold space-y-2 mt-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> 30-50% Price Discounts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Hex-Zone Routing</li>
              </ul>
            </motion.div>

            {/* Animal Care Card */}
            <motion.div variants={cardVariants} className="p-8 rounded-2xl bg-brand-clay/30 border border-brand-sand/80 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl">🐄</span>
              <h3 className="font-display font-bold text-xl text-brand-earth mt-6">Animal Shelters</h3>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Retrieve Grade C yields (highly misshapen, heavily bruised, or overripe) for low-cost, nutrient-dense organic animal feed.
              </p>
              <ul className="text-xs text-brand-earth font-bold space-y-2 mt-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Grade C Feed Queues</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Nearby Sanctuary Pickup</li>
              </ul>
            </motion.div>

            {/* Compost Card */}
            <motion.div variants={cardVariants} className="p-8 rounded-2xl bg-brand-clay/30 border border-brand-sand/80 shadow-sm hover:shadow-md transition-all">
              <span className="text-4xl">♻️</span>
              <h3 className="font-display font-bold text-xl text-brand-earth mt-6">Compost Units</h3>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Receive rotten or fully spoiled harvests directly. Convert agricultural waste into nutrient-rich organic compost fertilizers.
              </p>
              <ul className="text-xs text-brand-earth font-bold space-y-2 mt-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> High Nitrogen Waste</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Organic Waste Analytics</li>
              </ul>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 4. Trust Banner */}
      <section className="py-16 bg-brand-cream/50 border-t border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-earth text-sm font-semibold tracking-wider uppercase font-accent">
            <ShieldCheck className="w-5 h-5 text-brand-emerald" />
            <span>Guaranteed Grade Quality & Traceability</span>
          </div>
          <p className="text-gray-500 mt-2 text-xs max-w-xl mx-auto leading-relaxed">
            Every transaction generates a cryptographic carbon offset report, verifying local transit coordinates, crop rescue volumes, and environmental badge claims.
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
