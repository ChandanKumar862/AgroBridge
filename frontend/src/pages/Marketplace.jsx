import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Eye, Sparkles, Filter, CreditCard, ArrowUpDown, X, MessageSquare, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduce, setSelectedProduce] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedHexZone, setSelectedHexZone] = useState('');
  const [sortBy, setSortBy] = useState('urgency'); // default older harvest priority

  // Purchase state
  const [buying, setBuying] = useState(false);
  const [address, setAddress] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [grade, selectedHexZone, sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/produce', {
        params: {
          grade,
          hexZone: selectedHexZone,
          sortBy
        }
      });
      if (res.data.success) {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load listings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  // Dynamically compute sonar radar nodes in real-time based on active database produce listings
  const getDynamicRadarNodes = () => {
    // Group active database listings by hexZone to display as a unified farm supply center
    const groups = {};
    listings.forEach(item => {
      const zone = item.hexZone || 'HEX-14_22';
      if (!groups[zone]) {
        groups[zone] = [];
      }
      groups[zone].push(item);
    });

    const zonesConfig = {
      'HEX-14_22': { label: "Kumar Organic Farms", distance: "2.4 km", angle: 45, radius: 55 },
      'HEX-14_23': { label: "Patil Mango Orchard", distance: "6.8 km", angle: 135, radius: 95 },
      'HEX-15_22': { label: "Navi Green Collective", distance: "12.5 km", angle: 220, radius: 125 },
      'HEX-15_23': { label: "Thane Farmer Hub", distance: "3.7 km", angle: 300, radius: 55 },
      'HEX-15_24': { label: "Sahyadri Soil Yards", distance: "19.2 km", angle: 80, radius: 125 }
    };

    return Object.keys(groups).map(zone => {
      const itemsInZone = groups[zone];
      const config = zonesConfig[zone] || { label: itemsInZone[0].farmerName, distance: "10.0 km", angle: Math.random() * 360, radius: 100 };
      
      return {
        id: zone,
        label: itemsInZone[0].farmerName || config.label,
        crop: itemsInZone.map(i => i.name).join(', '),
        distance: config.distance,
        angle: config.angle,
        radius: config.radius,
        count: itemsInZone.length,
        active: true
      };
    });
  };

  const radarNodesList = getDynamicRadarNodes();

  // Initiate purchase workflow
  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!address) {
      alert("Please provide delivery details first!");
      return;
    }

    try {
      setBuying(true);
      const res = await api.post('/orders', {
        produceId: selectedProduce.id,
        paymentMethod: 'Wallet',
        deliveryDetails: { address },
        quantity: selectedQuantity
      });

      if (res.data.success) {
        setPurchaseSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        fetchListings(); // reload listings
        setTimeout(() => {
          setPurchaseSuccess(false);
          setSelectedProduce(null);
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed. Check balance.');
    } finally {
      setBuying(false);
    }
  };

  const handleContactFarmer = (farmerId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/messages', { state: { recipientId: farmerId } });
  };

  return (
    <div className="flex-grow bg-brand-cream/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-brand-earth tracking-tight">
              Ecosystem Rescued Produce Marketplace
            </h1>
            <p className="text-gray-500 text-sm font-accent mt-1">
              Monetizing Grade B/C visual blemishes to feed restaurants and save resource waste.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setGrade(''); setSelectedHexZone(''); setSearch(''); }}
              className="py-2 px-4 rounded-xl border border-brand-sand text-xs font-bold bg-white text-brand-earth hover:bg-brand-clay/30"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Double Pane Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7-COLUMNS or FULL WIDTH: Produce Listings */}
          <div className={`${user?.role === 'farmer' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
            
            {/* Search Bar & Order controls */}
            <div className="bg-white border border-brand-sand shadow-sm rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md flex-grow">
                <input
                  type="text"
                  placeholder="Search produce (e.g. Tomatoes, Carrots...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-sand rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </form>

              <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
                
                {/* Grade filter selection */}
                <div className="relative flex items-center bg-brand-cream border border-brand-sand rounded-xl px-3.5 py-3 text-sm">
                  <Filter className="w-4 h-4 text-brand-emerald mr-2" />
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-bold text-brand-earth"
                  >
                    <option value="">All Grades</option>
                    <option value="Grade B">Grade B (Aesthetic blemishes)</option>
                    <option value="Grade C">Grade C (Heavy blemish/Sanctuary)</option>
                  </select>
                </div>

                {/* Sort control */}
                <div className="relative flex items-center bg-brand-cream border border-brand-sand rounded-xl px-3.5 py-3 text-sm">
                  <ArrowUpDown className="w-4 h-4 text-brand-emerald mr-2" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-bold text-brand-earth"
                  >
                    <option value="urgency">Freshness Priority (Rescues Older Yields)</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="quantity_high">Quantity: High to Low</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="bg-white border border-brand-sand rounded-3xl p-6 h-64 animate-pulse space-y-4">
                    <div className="w-full bg-brand-clay/40 h-28 rounded-2xl" />
                    <div className="h-4 bg-brand-clay/40 rounded w-2/3" />
                    <div className="h-3 bg-brand-clay/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 bg-white border border-brand-sand rounded-3xl space-y-4">
                <span className="text-5xl">🌾</span>
                <h3 className="font-display font-extrabold text-xl text-brand-earth">No Rescued Crops Available</h3>
                <p className="text-gray-500 text-xs font-accent max-w-sm mx-auto">
                  Try clearing active hexagonal zones or visual grade filters to see listing matches.
                </p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'farmer' ? 'lg:grid-cols-3' : ''} gap-6`}>
                {listings.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`produce-${item.id}`}
                    onClick={() => { setSelectedProduce(item); setSelectedQuantity(item.quantity); }}
                    className="bg-white hover:bg-brand-cream border border-brand-sand shadow-sm hover:shadow-md hover:scale-[1.01] transition-all rounded-3xl p-5 space-y-4 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-3">
                      {/* Visual Image container */}
                      <div className="relative aspect-video rounded-2xl bg-brand-clay/40 border border-brand-sand overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">🍅</span>
                        )}
                        <span className={`absolute top-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full text-white shadow ${
                          item.aiGrading.grade === 'Grade B' ? 'bg-brand-amber' : 'bg-blue-600'
                        }`}>
                          {item.aiGrading.grade}
                        </span>
                        
                        <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-white/80 backdrop-blur px-2.5 py-1 rounded-md text-brand-earth border border-brand-sand shadow">
                          🕒 Urgency: {item.urgencyScore}%
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-brand-earth leading-tight">{item.name}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                            <span className="truncate">{item.location.address}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold bg-brand-sage/40 text-brand-earth px-2 py-0.5 rounded uppercase tracking-wider font-accent">
                          {item.hexZone}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-sand flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Discounted Price</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg font-extrabold font-mono text-brand-earth">
                            ₹{item.discountedPrice.toFixed(0)}/kg
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.originalPrice.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Qty Available</p>
                        <span className="font-accent font-extrabold text-sm text-brand-emerald">
                          {item.quantity} kg
                        </span>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 4-COLUMNS: Dynamic Proximity Sonar Logistics Radar */}
          {user?.role !== 'farmer' && (
            <div className="lg:col-span-4 bg-white border border-brand-sand rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 relative z-10">
              <h3 className="font-display font-extrabold text-lg text-brand-earth flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-emerald animate-pulse" />
                <span>Ecosystem Supply Radar</span>
              </h3>
              <p className="text-gray-500 text-xs font-accent">
                Click glowing farm sonar blips to filter nearby rescues.
              </p>
            </div>

            {/* Radar Grid Graphic Layers */}
            <div className="relative w-full aspect-square bg-[#0c1913] border border-emerald-950 rounded-2xl flex items-center justify-center p-2 shadow-inner overflow-hidden">
              
              {/* Radar Grid Graphic Lines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Sonar sweep beam animation */}
              <div 
                className="absolute w-full h-full bg-gradient-to-tr from-brand-emerald/0 via-brand-emerald/5 to-brand-emerald/25 origin-center pointer-events-none"
                style={{
                  borderRadius: '50%',
                  animation: 'spin 8s linear infinite'
                }}
              />

              {/* Concentric scan target bands */}
              <div className="absolute w-[85%] h-[85%] rounded-full border border-emerald-900/30 pointer-events-none flex items-center justify-center">
                <span className="absolute -top-3 text-[7px] font-bold text-emerald-700/60 font-mono tracking-widest">Extended (15-25km)</span>
                
                <div className="absolute w-[65%] h-[65%] rounded-full border border-emerald-800/40 pointer-events-none flex items-center justify-center">
                  <span className="absolute -top-3 text-[7px] font-bold text-emerald-600/70 font-mono tracking-widest">Mid-Range (5-15km)</span>
                  
                  <div className="absolute w-[40%] h-[40%] rounded-full border border-emerald-600/50 pointer-events-none flex items-center justify-center animate-pulse">
                    <span className="absolute -top-3 text-[7px] font-bold text-emerald-500/80 font-mono tracking-widest">Local (&lt;5km)</span>
                  </div>
                </div>
              </div>

              {/* Crosshair axis grids */}
              <div className="absolute w-[95%] h-px bg-emerald-950/40 pointer-events-none" />
              <div className="absolute h-[95%] w-px bg-emerald-950/40 pointer-events-none" />

              {/* Central Target Kitchen Hub */}
              <div className="absolute z-20 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center shadow-emerald-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 animate-ping" />
              </div>

              {/* Render glowing blips calculated on radial coordinates */}
              <svg viewBox="0 0 300 300" className="w-full h-full relative z-10">
                {radarNodesList.map((node) => {
                  const isSelected = selectedHexZone === node.id;
                  
                  // Trigonometric calculations converting polar coordinates to flat layout
                  const cx = 150;
                  const cy = 150;
                  const rad = (node.angle * Math.PI) / 180;
                  const x = cx + node.radius * Math.cos(rad);
                  const y = cy + node.radius * Math.sin(rad);

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedHexZone(selectedHexZone === node.id ? '' : node.id)}
                      className="cursor-pointer"
                    >
                      {/* Pulsing Sonar Ring Halo */}
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke={isSelected ? "#fbbf24" : "#10b981"}
                        strokeWidth="1.5"
                        opacity={isSelected ? "0.9" : "0.4"}
                        className="animate-ping"
                      />

                      {/* Radar Blip Core */}
                      <motion.circle
                        whileHover={{ r: 10, transition: { duration: 0.1 } }}
                        cx={x}
                        cy={y}
                        r={isSelected ? "9" : "6"}
                        fill={isSelected ? "#fbbf24" : "#10b981"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-md transition-all duration-300"
                      />

                      {/* Mini visual indicator label on hover */}
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#0c1913"
                        opacity="0.3"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar status hud info panel */}
            <AnimatePresence mode="wait">
              {selectedHexZone ? (
                (() => {
                  const node = radarNodesList.find(n => n.id === selectedHexZone);
                  return (
                    <motion.div 
                      key="selected-radar-hud"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-emerald-950 text-white rounded-2xl space-y-3 shadow-md border border-emerald-900"
                    >
                      <div className="flex justify-between items-center border-b border-emerald-900 pb-2">
                        <div>
                          <h4 className="text-xs font-extrabold font-display text-brand-sage leading-tight">
                            {node?.label}
                          </h4>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider font-accent block mt-0.5">
                            🔒 Proximity Sourced Pin
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedHexZone('')}
                          className="text-[9px] font-extrabold bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg uppercase"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] font-accent">
                        <div>
                          <p className="text-brand-sage font-bold uppercase text-[8px] tracking-widest">Sourcing Distance</p>
                          <p className="text-sm font-extrabold font-mono text-brand-gold mt-0.5">{node?.distance}</p>
                        </div>
                        <div>
                          <p className="text-brand-sage font-bold uppercase text-[8px] tracking-widest">Primary Crop</p>
                          <p className="text-sm font-extrabold truncate mt-0.5">{node?.crop}</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-emerald-900 flex items-center justify-between">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Carbon offset:</span>
                          <span className="text-[9px] font-extrabold text-brand-sage">
                            -{Math.round(listings.reduce((sum, item) => sum + parseFloat(item.quantity), 0) * 1.9)} kg CO₂
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <motion.div 
                  key="empty-radar-hud"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-brand-clay/30 border border-brand-sand/80 rounded-2xl text-xs text-gray-600 leading-relaxed font-accent space-y-2"
                >
                  <h4 className="font-extrabold text-brand-earth font-display text-xs flex items-center gap-1.5">
                    📡 Sonar Sourcing System
                  </h4>
                  <p>
                    Concentric bands show transportation distance thresholds. Procuring from the inner green rings (&lt;5km) guarantees the absolute lowest carbon emissions and ensures crops arrive at your kitchen ultra-fresh!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          )}

        </div>

      </div>

      {/* POPUP FULL DETAILS & Razorpay SIMULATION MODAL */}
      <AnimatePresence>
        {selectedProduce && (
          <div className="fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white border border-brand-sand shadow-premium w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-brand-sand">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-brand-earth">Rescued Crop Analysis</h3>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full text-white ${
                    selectedProduce.aiGrading.grade === 'Grade B' ? 'bg-brand-amber' : 'bg-blue-600'
                  }`}>
                    {selectedProduce.aiGrading.grade}
                  </span>
                </div>
                <button 
                  onClick={() => { setSelectedProduce(null); setPurchaseSuccess(false); }}
                  className="p-1 rounded-lg border border-brand-sand hover:bg-brand-cream"
                >
                  <X className="w-5 h-5 text-brand-earth" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {purchaseSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-6xl animate-bounce">🎉</span>
                    <h4 className="font-display font-extrabold text-2xl text-brand-emerald">Procurement Successful!</h4>
                    <p className="text-xs text-gray-500 font-accent max-w-sm">
                      Razorpay transaction validated. Wallet funds transferred to the farmer. Your carbon badges are updating!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Visual & Core Stats banner */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-5 aspect-video rounded-2xl bg-brand-clay/30 border border-brand-sand overflow-hidden flex items-center justify-center">
                        {selectedProduce.imageUrl ? (
                          <img src={selectedProduce.imageUrl} alt={selectedProduce.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl">🍅</span>
                        )}
                      </div>
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="font-display font-extrabold text-2xl text-brand-earth">{selectedProduce.name}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed font-accent">{selectedProduce.qualityNotes || "No farmer description notes provided."}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs bg-brand-cream border border-brand-sand p-3 rounded-2xl">
                          <p>⚖️ Qty: <strong>{selectedProduce.quantity} kg</strong></p>
                          <p>📅 Harvest: <strong>{new Date(selectedProduce.harvestDate).toLocaleDateString()}</strong></p>
                          <p>📍 Hex: <strong>{selectedProduce.hexZone}</strong></p>
                          <p>👤 Farmer: <strong>{selectedProduce.farmerName}</strong></p>
                        </div>
                      </div>
                    </div>

                    {/* Gemini AI grading quality factors report */}
                    <div className="p-5 bg-brand-earth text-white rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-sm text-brand-sage flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Gemini Vision AI Grading Report</span>
                        </h4>
                        <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                          Confidence: {(selectedProduce.aiGrading.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-200 leading-relaxed font-accent">
                        {selectedProduce.aiGrading.description}
                      </p>

                      {selectedProduce.aiGrading.defects && selectedProduce.aiGrading.defects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {selectedProduce.aiGrading.defects.map((def, i) => (
                            <span key={i} className="text-[10px] bg-white/10 text-brand-sage border border-white/10 rounded px-2 py-0.5 font-accent font-semibold uppercase">
                              ⚠️ {def}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* circular metrics metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-4 border-t border-white/10">
                        <div>
                          <p className="text-[10px] text-brand-sage font-bold">FRESHNESS</p>
                          <p className="font-mono font-extrabold text-lg mt-0.5">{selectedProduce.aiGrading.keyMetrics?.freshness || 80}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-brand-sage font-bold">APPEARANCE</p>
                          <p className="font-mono font-extrabold text-lg mt-0.5">{selectedProduce.aiGrading.keyMetrics?.appearance || 60}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-brand-sage font-bold">EDIBILITY</p>
                          <p className="font-mono font-extrabold text-lg mt-0.5">{selectedProduce.aiGrading.keyMetrics?.edibility || 100}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Placement form gate */}
                    {user ? (
                      <div className="p-5 bg-brand-clay/30 border border-brand-sand rounded-2xl space-y-4">
                        <h4 className="font-display font-bold text-sm text-brand-earth flex items-center gap-1.5">
                          <CreditCard className="w-4.5 h-4.5 text-brand-emerald" />
                          <span>Direct Procurement & Checkout Gateway</span>
                        </h4>

                        <div className="space-y-3">
                          {/* Quantity selector control */}
                          <div className="bg-white border border-brand-sand rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
                            <div>
                              <span className="block text-[10px] font-bold text-brand-earth uppercase tracking-wider font-accent">
                                Quantity to Purchase (in kg)
                              </span>
                              <p className="text-[10px] text-gray-500 font-accent mt-0.5">
                                Available batch size: <strong className="text-brand-emerald">{selectedProduce.quantity} kg</strong>
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                                className="w-9 h-9 rounded-xl bg-brand-cream hover:bg-brand-clay border border-brand-sand flex items-center justify-center font-extrabold text-brand-earth transition-all select-none"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={selectedProduce.quantity}
                                step="1"
                                value={selectedQuantity}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 1;
                                  setSelectedQuantity(Math.min(selectedProduce.quantity, Math.max(1, val)));
                                }}
                                className="w-20 bg-brand-cream border border-brand-sand rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-center focus:outline-none focus:border-brand-emerald"
                              />
                              <button
                                type="button"
                                onClick={() => setSelectedQuantity(prev => Math.min(selectedProduce.quantity, prev + 1))}
                                className="w-9 h-9 rounded-xl bg-brand-cream hover:bg-brand-clay border border-brand-sand flex items-center justify-center font-extrabold text-brand-earth transition-all select-none"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-accent mb-1">
                              Your Delivery / Shipping Address
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Address details, City, Pin"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full bg-white border border-brand-sand rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-emerald"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <div>
                              <p className="text-[10px] text-gray-500 font-bold">TOTAL ORDER AMOUNT</p>
                              <p className="text-xl font-extrabold text-brand-earth font-mono">
                                ₹{(selectedProduce.discountedPrice * selectedQuantity).toFixed(2)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleContactFarmer(selectedProduce.farmerId)}
                                className="btn-secondary py-2.5 px-4 text-xs font-semibold"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>Message Farmer</span>
                              </button>
                              
                              <button
                                onClick={handlePurchase}
                                disabled={buying}
                                className="btn-primary py-2.5 px-5 text-xs font-semibold"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Pay ₹{(selectedProduce.discountedPrice * selectedQuantity).toFixed(0)}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-yellow-600" />
                        <span>Please <Link to="/login" className="font-bold hover:underline">Log in</Link> to buy directly or message this farmer!</span>
                      </div>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Marketplace;
