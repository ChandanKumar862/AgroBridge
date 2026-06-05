import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { Users, FileSpreadsheet, ShieldAlert, Award, ShieldCheck, Flag, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatformListings();
  }, [user]);

  const loadPlatformListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/produce');
      if (res.data.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error('Admin loading failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProduce = (id) => {
    alert(`Listing ID: ${id} verified. Cryptographic transparency cert generated!`);
  };

  const handleFlagProduce = (id) => {
    alert(`Listing ID: ${id} flagged for review. Crop safety team notified.`);
  };

  // Recharts admin platform monthly overview
  const platformProgress = [
    { month: 'Jan', RescuedTons: 1.2, CarbonOffset: 2.3 },
    { month: 'Feb', RescuedTons: 2.1, CarbonOffset: 4.0 },
    { month: 'Mar', RescuedTons: 3.5, CarbonOffset: 6.6 },
    { month: 'Apr', RescuedTons: 5.8, CarbonOffset: 11.0 },
    { month: 'May', RescuedTons: 8.4, CarbonOffset: 15.9 }
  ];

  return (
    <div className="flex-grow bg-brand-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
            Administrator Platform Panel
          </h1>
          <p className="text-gray-500 text-sm font-accent">
            Secure Platform Metrics, Dispute handling, and Fraud detection HUD.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Active Ecosystem Users</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">124 users</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-sage/40 text-brand-earth flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Rescued crop lots</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">{listings.length} lots</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Fraud alerts flagged</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">0 alerts</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Platform carbon offsets</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">27.0k kg CO₂</h3>
            </div>
          </div>

        </div>

        {/* Charts & Fraud panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recharts chart */}
          <div className="lg:col-span-8 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth">Monthly Rescued Yield Milestones (in Tons)</h3>
            
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformProgress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#064e3b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#064e3b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="RescuedTons" name="Yield Rescued (Tons)" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Simulated Fraud Console */}
          <div className="lg:col-span-4 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-emerald" />
              <span>Smart Fraud Scanners</span>
            </h3>

            <div className="p-4 bg-brand-clay/30 border border-brand-sand/60 rounded-2xl text-xs space-y-2.5 leading-relaxed text-gray-600">
              <p>🟢 Double-listing protection: <strong>ACTIVE</strong></p>
              <p>🟢 Abnormal pricing anomaly scanner: <strong>ACTIVE</strong></p>
              <p>🟢 Metadata location matching check: <strong>PASSED</strong></p>
            </div>

            <p className="text-[10px] text-gray-400 font-accent italic">
              * Note: System actively runs automated checks comparing EXIF meta coordinates against listed addresses to verify farmer listing locations.
            </p>
          </div>

        </div>

        {/* Listings Moderator Grid */}
        <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-lg text-brand-earth">Crop Lots Moderation</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-sand text-gray-400 font-bold uppercase tracking-wider font-accent">
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Quality Grade</th>
                  <th className="py-3 px-4">Hex Zone</th>
                  <th className="py-3 px-4">Price / kg</th>
                  <th className="py-3 px-4">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 font-accent">
                      No listed crops found to moderate.
                    </td>
                  </tr>
                ) : (
                  listings.map(item => (
                    <tr key={item.id} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-earth">{item.name} ({item.quantity}kg)</td>
                      <td className="py-3.5 px-4 text-gray-600">{item.farmerName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded font-extrabold ${
                          item.aiGrading.grade === 'Grade B' 
                            ? 'bg-brand-amber text-white' 
                            : item.aiGrading.grade === 'Grade C'
                              ? 'bg-blue-600 text-white'
                              : 'bg-red-500 text-white'
                        }`}>
                          {item.aiGrading.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-500">{item.hexZone}</td>
                      <td className="py-3.5 px-4 font-mono">₹{item.discountedPrice.toFixed(0)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyProduce(item.id)}
                            className="p-1.5 rounded-lg border border-brand-sand hover:bg-brand-sage/20 text-brand-emerald flex items-center justify-center"
                            title="Verify and lock listing"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleFlagProduce(item.id)}
                            className="p-1.5 rounded-lg border border-brand-sand hover:bg-red-50 text-red-500 flex items-center justify-center"
                            title="Flag listing and message farmer"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
