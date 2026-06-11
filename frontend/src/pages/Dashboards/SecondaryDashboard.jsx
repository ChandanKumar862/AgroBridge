import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { Calendar, MapPin, Truck, Leaf, ShieldAlert, Award, Clock } from 'lucide-react';
import { api as axiosApi } from '../../context/AuthContext';

const SecondaryDashboard = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCompost = user?.role === 'compost';

  useEffect(() => {
    loadPickups();
  }, [user]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setPickups(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load secondary pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Complete organic waste collection simulation
  const handleVerifyPickup = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status: 'Collected' });
      if (res.data.success) {
        alert("Pickup successfully verified! Carbon points added to profile.");
        loadPickups(); // reload
      }
    } catch (err) {
      alert("Verification update failed.");
    }
  };

  return (
    <div className="flex-grow bg-brand-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
            {isCompost ? "Organic Compost Processing Console" : "Animal Care Sanctuary Feed Board"}
          </h1>
          <p className="text-gray-500 text-sm font-accent">
            Role: <strong>{isCompost ? "Compost Yard Node" : "Sanctuary Feed Manager"}</strong> — {user?.name} ({user?.organization || 'Green Earth Hub'})
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">
                {isCompost ? "Compost Intake" : "Rescued Feed Weight"}
              </p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {pickups.reduce((sum, p) => sum + parseFloat(p.quantity), 0)} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 text-brand-amber flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Methane / CO₂ Prevented</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {Math.round(pickups.reduce((sum, p) => sum + parseFloat(p.quantity), 0) * 1.9)} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Carbon Badges</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">{user?.sustainabilityScore || 100} pts</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-clay/50 text-brand-earth flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Active Pickups</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {pickups.filter(p => p.status === 'Pickup Scheduled').length} routes
              </h3>
            </div>
          </div>

        </div>

        {/* Pickup queues list */}
        <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-lg text-brand-earth">
            {isCompost ? "Rescued Rotten Crop Pickup Queue" : "Grade C Sanctuary Feed Pickup Queue"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pickups.length === 0 ? (
              <div className="col-span-full text-center py-20 text-xs text-gray-500 font-accent bg-brand-cream/30 border border-brand-sand rounded-3xl space-y-2">
                <span className="text-3xl">🚛</span>
                <p>No agricultural pickups mapped yet.</p>
              </div>
            ) : (
              pickups.map(item => (
                <div 
                  key={item.id}
                  className="p-5 bg-brand-cream border border-brand-sand rounded-3xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold bg-brand-emerald text-white px-2.5 py-0.5 rounded">
                        {item.produceName} ({item.quantity}kg)
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                        {item.grade}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 font-accent">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0 text-brand-emerald" />
                        <span>Farm: {item.farmerName}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 shrink-0 text-brand-emerald" />
                        <span>Pickup: {new Date(item.scheduledPickupDate).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-sand flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      Status: <strong>{item.status}</strong>
                    </span>
                    
                    {item.status === 'Pickup Scheduled' && (
                      <button
                        onClick={() => handleVerifyPickup(item.id)}
                        className="py-1.5 px-3 bg-brand-earth hover:bg-brand-earth/95 text-white font-semibold text-[10px] rounded-xl transition-all"
                      >
                        Verify Collection
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecondaryDashboard;
