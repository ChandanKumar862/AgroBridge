import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Leaf, Clock, CheckCircle, MessageSquare, AlertCircle, ShoppingBag, Plus, Trash2 } from 'lucide-react';

const FarmerListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myCrops, setMyCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmerCrops();
  }, [user]);

  const loadFarmerCrops = async () => {
    try {
      setLoading(true);
      // Load all crops
      const res = await api.get('/produce');
      if (res.data.success) {
        // Filter out listings belonging to this specific Farmer
        // Including Sold / Redirected crops so they see the entire transaction state
        const allListings = res.data.data;
        
        // Let's fetch the complete logs including sold lots directly from our orders collection
        const ordersRes = await api.get('/orders');
        const ordersList = ordersRes.data.success ? ordersRes.data.data : [];

        // Map produce status and buyer interest
        const list = allListings
          .filter(item => item.farmerId === user?.id)
          .map(crop => {
            // Find all active buyer matched orders for this crop
            const matchedOrders = ordersList.filter(o => o.produceId === crop.id);
            return {
              ...crop,
              matchedOrders,
              matchedOrder: matchedOrders[0] || null
            };
          });

        // Also add fully Sold/Archived ones from the orders list that might be cleared from active produce catalog
        ordersList.forEach(order => {
          if (order.farmerId === user?.id && !list.find(c => c.id === order.produceId)) {
            list.push({
              id: order.produceId,
              name: order.produceName,
              quantity: order.quantity,
              discountedPrice: order.price / order.quantity,
              originalPrice: order.price / order.quantity,
              harvestDate: new Date().toISOString(), // fallback
              hexZone: order.grade === 'Rotten/Unusable' ? 'HEX-COMP' : 'HEX-SOLD',
              aiGrading: { grade: order.grade },
              status: order.buyerRole === 'compost' ? 'Redirected' : 'Sold',
              matchedOrder: order,
              matchedOrders: [order]
            });
          }
        });

        // Sort by newest listed first
        list.sort((a, b) => new Date(b.createdAt || 1) - new Date(a.createdAt || 1));
        setMyCrops(list);
      }
    } catch (err) {
      console.error('Failed to load farmer yields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing from the market?")) return;
    try {
      const res = await api.delete(`/produce/${id}`);
      if (res.data.success) {
        alert("Listing successfully deleted!");
        loadFarmerCrops();
      }
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleMessageBuyer = (buyerId, buyerName) => {
    navigate('/messages', { state: { recipientId: buyerId, recipientName: buyerName } });
  };

  return (
    <div className="flex-grow bg-brand-cream/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-sand/60 pb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
              My Crop Yields & Buyer Interest
            </h1>
            <p className="text-gray-500 text-sm font-accent mt-1">
              Monitor your listed yields, check dynamic buyer matching, and oversee pickup coordinations.
            </p>
          </div>
          <Link to="/upload" className="btn-primary py-3 px-6 text-sm font-semibold shadow flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-sage" />
            <span>List New Crop</span>
          </Link>
        </div>

        {/* Dashboard Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(idx => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-brand-sand h-48 animate-pulse" />
            ))}
          </div>
        ) : myCrops.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-sand rounded-3xl space-y-4">
            <span className="text-5xl">🌾</span>
            <h3 className="font-display font-extrabold text-xl text-brand-earth">No Crops Listed Yet</h3>
            <p className="text-gray-500 text-xs font-accent max-w-sm mx-auto">
              You haven't listed any Grade B/C crop lots. Click "List New Crop" above to run Gemini AI grading and find buyers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myCrops.map((crop) => {
              const matchedOrders = crop.matchedOrders || [];
              const hasOrders = matchedOrders.length > 0;
              const isSold = crop.status === 'Sold';
              const isRotten = crop.aiGrading?.grade === 'Rotten/Unusable' || crop.status === 'Redirected';

              return (
                <div 
                  key={crop.id}
                  className="bg-white border border-brand-sand shadow-sm hover:shadow-md transition-all rounded-3xl p-6 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header: Crop name & grade tag */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-extrabold text-xl text-brand-earth">{crop.name}</h3>
                        <p className="text-xs text-brand-emerald font-accent font-bold mt-0.5">{crop.quantity} kg remaining</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold text-white ${
                          isRotten 
                            ? 'bg-rose-500' 
                            : crop.aiGrading.grade === 'Grade B' 
                              ? 'bg-brand-amber' 
                              : 'bg-blue-600'
                        }`}>
                          {crop.aiGrading.grade}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 font-mono">{crop.hexZone}</span>
                      </div>
                    </div>

                    {/* Pricing box */}
                    <div className="p-3 bg-brand-cream border border-brand-sand/60 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Discounted Price</p>
                        <p className="text-sm font-extrabold text-brand-earth font-mono mt-0.5">₹{crop.discountedPrice.toFixed(0)}/kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-accent">Batch Unit Rate</p>
                        <p className="text-sm font-extrabold text-brand-emerald font-mono mt-0.5">₹{crop.originalPrice.toFixed(0)}/kg</p>
                      </div>
                    </div>

                    {/* DYNAMIC BUYER INTEREST HUD STATUS */}
                    <div className="pt-3 border-t border-brand-sand">
                      {isRotten ? (
                        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-2.5 items-start text-xs text-rose-800">
                          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                          <div>
                            <p className="font-extrabold">Rotten Redirect — Composting</p>
                            <p className="text-[10px] text-rose-600 font-accent mt-0.5">Gemini graded as Rotten. Automatically routed to Navin Compost Yard fertilizer processing.</p>
                          </div>
                        </div>
                      ) : isSold ? (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-2.5 items-start text-xs text-blue-800">
                            <CheckCircle className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-extrabold">Completed Rescue — Settled</p>
                              <p className="text-[10px] text-blue-600 font-accent mt-0.5">
                                Crop fully rescued and settled! Wallet funds credited successfully.
                              </p>
                            </div>
                          </div>
                          {hasOrders && (
                            <div className="space-y-2">
                              {matchedOrders.map(order => (
                                <div key={order.id} className="p-3 bg-brand-clay/20 border border-brand-sand rounded-xl text-[10px] text-brand-earth leading-relaxed space-y-1">
                                  <p className="font-bold flex justify-between">
                                    <span>✓ Rescued: {order.quantity} kg</span>
                                    <span className="font-mono font-extrabold">₹{order.price.toFixed(0)}</span>
                                  </p>
                                  <p className="text-gray-500 font-accent">Buyer: <strong>{order.buyerName}</strong></p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Active listing search status */}
                          <div className="p-3.5 bg-yellow-50/50 border border-yellow-100/80 rounded-2xl flex gap-2.5 items-start text-xs text-yellow-800">
                            <Clock className="w-5 h-5 shrink-0 text-yellow-500 mt-0.5" />
                            <div className="flex-grow">
                              <p className="font-extrabold text-brand-amber">Sourcing — Looking for Buyer</p>
                              <p className="text-[10px] text-yellow-700 font-accent mt-0.5">Currently active on the Circular Radar. Local buyer scan active.</p>
                            </div>
                            
                            {/* Allow deletion only if no buyer has bought any part yet */}
                            {!hasOrders && (
                              <button
                                onClick={() => handleDeleteListing(crop.id)}
                                className="p-1 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 self-center"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* List of partial purchases under this active listing */}
                          {hasOrders && (
                            <div className="space-y-2 pt-2">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-accent">
                                Sourced Lots ({matchedOrders.reduce((sum, o) => sum + o.quantity, 0)} kg sold):
                              </p>
                              {matchedOrders.map(order => (
                                <div key={order.id} className="p-3.5 bg-brand-sage/20 border border-brand-emerald/20 rounded-2xl space-y-3 text-xs text-brand-earth">
                                  <div className="flex gap-2.5 items-start">
                                    <ShoppingBag className="w-5 h-5 shrink-0 text-brand-emerald mt-0.5" />
                                    <div className="flex-grow">
                                      <p className="font-extrabold text-brand-emerald">{order.quantity} kg Matched & Paid!</p>
                                      <p className="text-[10px] text-gray-600 font-accent mt-0.5">
                                        Buyer <strong>{order.buyerName} ({order.buyerRole.replace('_', ' ')})</strong> is ready to collect.
                                      </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-white/60 px-2 py-0.5 rounded border border-brand-sand">
                                      ₹{order.price.toFixed(0)}
                                    </span>
                                  </div>
                                  
                                  <div className="bg-white/80 p-2.5 border border-brand-sand rounded-xl text-[10px] space-y-1.5 text-gray-500 leading-snug">
                                    <p>🚚 Transit Address: <strong>{order.deliveryDetails.address}</strong></p>
                                    <p className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                                      <span>Pickup: <strong>{new Date(order.scheduledPickupDate).toLocaleString()}</strong></span>
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => handleMessageBuyer(order.buyerId, order.buyerName)}
                                    className="w-full btn-secondary py-2 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-brand-emerald" />
                                    <span>Contact Buyer</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default FarmerListings;
