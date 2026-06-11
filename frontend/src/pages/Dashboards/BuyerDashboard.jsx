import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import { Wallet, Plus, Download, Tag, Leaf, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BuyerDashboard = () => {
  const { user, rechargeWallet } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wallet recharge state
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [rechargeMsg, setRechargeMsg] = useState('');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!rechargeAmt || parseFloat(rechargeAmt) <= 0) return;

    const result = await rechargeWallet(parseFloat(rechargeAmt));
    if (result.success) {
      setRechargeMsg(`Successfully loaded ₹${parseFloat(rechargeAmt).toFixed(0)} to wallet!`);
      setRechargeAmt('');
      setTimeout(() => setRechargeMsg(''), 3000);
    } else {
      setRechargeMsg('Recharge failed. Please try again.');
    }
  };

  // Recharts saving charts data
  const savingsData = [
    { month: 'Jan', StandardRetail: 2000, RescuedPrice: 1200 },
    { month: 'Feb', StandardRetail: 3400, RescuedPrice: 2100 },
    { month: 'Mar', StandardRetail: 2900, RescuedPrice: 1800 },
    { month: 'Apr', StandardRetail: 4200, RescuedPrice: 2600 },
    { month: 'May', StandardRetail: 5100, RescuedPrice: 3200 }
  ];

  return (
    <div className="flex-grow bg-brand-cream/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
              Buyer Procurement Console
            </h1>
            <p className="text-gray-500 text-sm font-accent">
              Commercial Buyer dashboard for: <strong>{user?.name} ({user?.organization || 'Commercial Kitchen'})</strong>
            </p>
          </div>
          <Link to="/marketplace" className="btn-primary py-3 px-6 text-sm font-semibold shadow">
            Browse Marketplace
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Available Wallet</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">₹{user?.balance?.toFixed(2)}</h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-sage/40 text-brand-earth flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Rescued Yield</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {orders.reduce((sum, o) => sum + parseFloat(o.quantity), 0)} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 text-brand-amber flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Carbon Prevented</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {Math.round(orders.reduce((sum, o) => sum + parseFloat(o.quantity), 0) * 1.9)} kg
              </h3>
            </div>
          </div>

          <div className="bg-white border border-brand-sand rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase font-accent">Carbon Points</p>
              <h3 className="text-xl font-extrabold font-mono text-brand-earth">
                {user?.sustainabilityScore || 100} pts
              </h3>
            </div>
          </div>

        </div>

        {/* Charts & Wallet Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recharts chart */}
          <div className="lg:col-span-8 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth">Procurement Cost Savings (Standard vs Grade B/C)</h3>
            
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#064e3b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#064e3b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="StandardRetail" name="Standard Premium Price" fill="#efe8d9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="RescuedPrice" name="Rescued B/C Price" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wallet Recharge form */}
          <div className="lg:col-span-4 bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-lg text-brand-earth">Simulated Razorpay Recharge</h3>
            
            {rechargeMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                {rechargeMsg}
              </div>
            )}

            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-accent mb-1.5">
                  Amount to Load (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1000"
                  value={rechargeAmt}
                  onChange={(e) => setRechargeAmt(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmt(amt.toString())}
                    className="py-2 bg-brand-cream border border-brand-sand hover:bg-brand-clay text-xs rounded-xl font-bold font-mono text-brand-earth transition-all"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 text-xs font-semibold"
              >
                <Plus className="w-4 h-4 text-brand-sage" />
                <span>Simulate Razorpay Gateway</span>
              </button>
            </form>
          </div>

        </div>

        {/* Orders list table */}
        <div className="bg-white border border-brand-sand rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-extrabold text-lg text-brand-earth">Procurement Purchase History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-sand text-gray-400 font-bold uppercase tracking-wider font-accent">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Crop Purchased</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 font-accent">
                      No past purchases found. Go to 'Marketplace' to buy rescued yields.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-500">{order.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-brand-earth">{order.produceName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${
                          order.grade === 'Grade B' 
                            ? 'bg-brand-amber text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {order.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-brand-emerald">{order.quantity} kg</td>
                      <td className="py-3.5 px-4 font-mono font-bold">₹{order.price.toFixed(0)}</td>
                      <td className="py-3.5 px-4 text-gray-600">{order.farmerName}</td>
                      <td className="py-3.5 px-4">
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`Downloading invoice ${order.invoiceNumber} (MOCK)`); }}
                          className="text-brand-emerald hover:underline flex items-center gap-1 font-bold"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span>PDF</span>
                        </a>
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

export default BuyerDashboard;
