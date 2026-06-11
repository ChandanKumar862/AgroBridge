import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Leaf, Wallet, ArrowUpRight, Plus, Eye, CheckCircle, Clock, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load Farmer listed produce
        const produceRes = await api.get('/produce');
        if (produceRes.data.success) {
          // Filter produce posted by this farmer
          const myListings = produceRes.data.data.filter(item => item.farmerId === user?.id || item.status === 'Sold' || item.status === 'Redirected');
          setListings(myListings);
        }

        // Load Farmer orders
        const ordersRes = await api.get('/orders');
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Recharts weekly yields rescued chart mapping
  const weeklyRescues = [
    { day: 'Mon', RescuedKg: 40, Earnings: 800 },
    { day: 'Tue', RescuedKg: 65, Earnings: 1300 },
    { day: 'Wed', RescuedKg: 50, Earnings: 1000 },
    { day: 'Thu', RescuedKg: 95, Earnings: 1900 },
    { day: 'Fri', RescuedKg: 70, Earnings: 1400 },
    { day: 'Sat', RescuedKg: 110, Earnings: 2200 },
    { day: 'Sun', RescuedKg: 85, Earnings: 1700 }
  ];

  return (
    <div className="flex-grow bg-brand-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Title Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
              Farmer Harvest Board
            </h1>
            <p className="text-gray-500 text-sm font-accent">
              Welcome back, <strong>{user?.name}</strong>. Track your listings, earnings, and ecological metrics.
            </p>
          </div>
          <Link to="/upload" className="btn-primary py-3 px-6 text-sm font-semibold shadow flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-sage" />
            <span>List Crop & Grade</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Wallet Earnings</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">₹{user?.balance?.toFixed(2)}</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-sage/40 text-brand-earth flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Rescued Yield</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {listings.reduce((sum, item) => sum + parseFloat(item.quantity), 0)} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 text-brand-amber flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Carbon Points</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">{user?.sustainabilityScore || 100} pts</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Active Orders</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {orders.filter(o => o.status !== 'Delivered').length} orders
              </h3>
            </div>
          </div>

        </div>

        {/* Charts & Listings split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Recharts Earnings graph */}
          <div className="lg:col-span-7 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth">Crop Monetization History</h3>
            
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRescues}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#064e3b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#064e3b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Earnings" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Active Order Pickup Timelines */}
          <div className="lg:col-span-5 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth">Logistics Pickups Queue</h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 font-accent">
                  No pickup orders mapped yet.
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-3.5 bg-brand-cream border border-brand-sand rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-brand-earth">{order.produceName} ({order.quantity}kg)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        order.status === 'Paid' 
                          ? 'bg-brand-sage/40 text-brand-earth' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 font-accent">
                      Buyer: <strong>{order.buyerName} ({order.buyerRole.replace('_', ' ')})</strong>
                    </p>
                    
                    <div className="flex gap-1.5 items-center text-[10px] text-gray-400 font-accent">
                      <Clock className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                      <span>Pickup: {new Date(order.scheduledPickupDate).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Farmer listings list table */}
        <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-lg text-brand-earth">All Listed Crops</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-sand text-gray-400 font-bold uppercase tracking-wider font-accent">
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">AI Quality Grade</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Listed Price</th>
                  <th className="py-3 px-4">Zonal Hex</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 font-accent">
                      You haven't listed any crops yet. Click 'List Crop & Grade' above to begin.
                    </td>
                  </tr>
                ) : (
                  listings.map(item => (
                    <tr key={item.id} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-earth">{item.name}</td>
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
                      <td className="py-3.5 px-4 font-semibold text-brand-emerald">{item.quantity} kg</td>
                      <td className="py-3.5 px-4 font-mono">₹{item.discountedPrice.toFixed(0)}/kg</td>
                      <td className="py-3.5 px-4 font-bold text-gray-500">{item.hexZone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          item.status === 'Available' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-brand-clay text-brand-earth border border-brand-sand'
                        }`}>
                          {item.status}
                        </span>
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

export default FarmerDashboard;
