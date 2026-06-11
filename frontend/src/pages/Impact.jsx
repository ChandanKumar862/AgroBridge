import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Trophy, ShieldAlert, Award, Droplets, Info } from 'lucide-react';
import { api } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Impact = () => {
  const [stats, setStats] = useState({
    global: {
      totalWastePreventedKg: 14250,
      co2ReducedKg: 27075,
      waterSavedLitre: 9975000
    },
    leaderboard: [
      { id: "lead-1", name: "Ramesh Kumar", role: "farmer", score: 850, badge: "Eco Guardian" },
      { id: "lead-2", name: "Green Earth Compost", role: "compost", score: 720, badge: "Soil Master" },
      { id: "lead-3", name: "Vikas Patil", role: "farmer", score: 680, badge: "Waste Warrior" },
      { id: "lead-4", name: "Taj Regency Hotel", role: "buyer", score: 610, badge: "Green Gastronomy" },
      { id: "lead-5", name: "Happy Paws Sanctuary", role: "animal_care", score: 540, badge: "Animal Ally" }
    ]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.warn('Analytics loading error, using local fallback:', err.message);
      }
    };
    fetchAnalytics();
  }, []);

  // Format Recharts data mapping offset contributions
  const chartData = [
    { name: 'Organic Waste (kg)', Value: stats.global.totalWastePreventedKg, fill: '#059669' },
    { name: 'CO₂ Avoided (kg)', Value: stats.global.co2ReducedKg, fill: '#d97706' },
    { name: 'Water Saved (100L)', Value: Math.round(stats.global.waterSavedLitre / 100), fill: '#38bdf8' }
  ];

  return (
    <div className="flex-grow bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-emerald font-accent font-bold uppercase tracking-wider text-sm">
            📊 SUSTAINABILITY SCOREBOARD
          </span>
          <h1 className="font-display font-extrabold text-4xl text-brand-earth tracking-tight">
            Our Collective Ecological Footprint
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base font-accent">
            Track real-time organic food recovery, greenhouse gas offsets, and see the eco pioneers leading the charge.
          </p>
        </div>

        {/* Top KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="p-8 rounded-3xl bg-brand-cream border border-brand-sand flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase font-accent">Rescued Food</p>
              <h3 className="text-2xl font-extrabold text-brand-earth font-mono">
                {stats.global.totalWastePreventedKg.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-brand-cream border border-brand-sand flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-amber/10 text-brand-amber rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase font-accent">Carbon Prevented</p>
              <h3 className="text-2xl font-extrabold text-brand-earth font-mono">
                {stats.global.co2ReducedKg.toLocaleString()} kg
              </h3>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-brand-cream border border-brand-sand flex items-center gap-6">
            <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center">
              <Droplets className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase font-accent">Irrigation Water Saved</p>
              <h3 className="text-2xl font-extrabold text-brand-earth font-mono">
                {stats.global.waterSavedLitre.toLocaleString()} Litres
              </h3>
            </div>
          </div>

        </div>

        {/* Charts & Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Recharts Column */}
          <div className="lg:col-span-7 bg-brand-clay/20 border border-brand-sand/80 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
            <h3 className="font-display font-extrabold text-xl text-brand-earth flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-emerald" />
              <span>Environmental Resource Recovery Savings</span>
            </h3>
            
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#064e3b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#064e3b" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="Value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 italic leading-relaxed text-center">
              * Note: Water saved metric is normalized at 700L per kg average food rescued, representing embedded growing water.
            </p>
          </div>

          {/* Gamified Leaderboard Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 md:p-8 rounded-3xl bg-brand-earth text-white shadow-premium relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-brand-sage animate-bounce" />
                <h3 className="font-display font-extrabold text-xl text-brand-sage">Ecosystem Leaderboard</h3>
              </div>

              {/* Leaderboard Entries */}
              <div className="space-y-4">
                {stats.leaderboard.map((item, idx) => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center bg-white/10 hover:bg-white/15 p-3.5 rounded-xl transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-brand-sage w-5">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-300 font-accent font-semibold uppercase mt-0.5">
                          {item.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold bg-brand-emerald text-white px-2 py-0.5 rounded-full font-mono">
                        {item.score} pts
                      </span>
                      <span className="block text-[10px] text-brand-sage font-bold mt-1 uppercase font-accent">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges explanation panel */}
            <div className="bg-brand-clay/30 border border-brand-sand p-6 rounded-3xl space-y-4">
              <h4 className="font-display font-bold text-sm text-brand-earth flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-amber" />
                <span>Earn Green Accomplishment Badges</span>
              </h4>
              <div className="space-y-2.5 text-xs text-gray-600">
                <p>🍅 <strong>Eco Guardian</strong>: Score &gt; 800 points. Reserved for supreme organic food rescuers.</p>
                <p>🌱 <strong>Soil Master</strong>: Score 500 - 800 points. Granted for large volume compost conversions.</p>
                <p>🌾 <strong>Waste Warrior</strong>: Score 250 - 500 points. Granted for consistent Grade B list monetizations.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Impact;
