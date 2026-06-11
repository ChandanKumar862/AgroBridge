import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, MicOff, Sparkles, MapPin, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

const UploadProduce = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualityNotes, setQualityNotes] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  
  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [gradingStep, setGradingStep] = useState(0); // 0=none, 1=uploading, 2=blemish, 3=shape, 4=done
  const [gradingResult, setGradingResult] = useState(null);

  const fileInputRef = useRef(null);

  // HTML5 Web Speech API integration
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome/Edge for voice assistance.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Optimized for Indian accented English
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('Listening for crop name, quantity, and price...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(`Heard: "${transcript}"`);
      parseVoiceTranscript(transcript);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
      setVoiceText('Speech capture failed, please enter manually.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Smart parser extracting keywords from voice transcript
  const parseVoiceTranscript = (text) => {
    const txt = text.toLowerCase();
    
    // 1. Detect crop names
    const crops = ['tomato', 'potato', 'onion', 'carrot', 'banana', 'apple', 'mango', 'orange', 'grape', 'spinach'];
    for (const crop of crops) {
      if (txt.includes(crop)) {
        setName(crop.charAt(0).toUpperCase() + crop.slice(1));
        break;
      }
    }

    // 2. Detect quantities (e.g., "forty", "40 kilograms", "50 kg")
    const qtyMatch = txt.match(/(\d+)\s*(?:kg|kilogram|kilo|ton|quintal)?/);
    if (qtyMatch) {
      setQuantity(qtyMatch[1]);
    } else {
      // verbal conversions
      const numbers = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'ten': 10, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'hundred': 100 };
      for (const word in numbers) {
        if (txt.includes(word)) {
          setQuantity(numbers[word]);
          break;
        }
      }
    }

    // 3. Detect expected price (e.g., "thirty rupees", "price twenty", "₹40")
    const priceMatch = txt.match(/(?:price|rate|rupee|rs|cost)?\s*(\d+)/);
    if (priceMatch && !txt.includes(priceMatch[1] + ' kg')) {
      setExpectedPrice(priceMatch[1]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload at least one image for AI crop grading!");
      return;
    }

    setLoading(true);
    setGradingStep(1); // Uploading files

    // Simulation timing intervals showing AI steps
    const stepIntervals = [
      { step: 2, label: "Scanning surface skin blemishes...", delay: 1000 },
      { step: 3, label: "Evaluating shape uniformity indexes...", delay: 2200 },
      { step: 4, label: "Applying recommended discount structures...", delay: 3500 }
    ];

    stepIntervals.forEach(item => {
      setTimeout(() => {
        setGradingStep(item.step);
      }, item.delay);
    });

    // Fire actual network request
    const formData = new FormData();
    formData.append('name', name);
    formData.append('quantity', quantity);
    formData.append('expectedPrice', expectedPrice);
    formData.append('harvestDate', harvestDate);
    formData.append('qualityNotes', qualityNotes);
    formData.append('image', image);
    
    // Inject fallback location coordinates (Mumbai farm base)
    const fallbackLocation = {
      address: user?.location?.address || 'Mumbai Farm Hub, Maharashtra',
      latitude: user?.location?.latitude || 19.0760,
      longitude: user?.location?.longitude || 72.8777
    };
    formData.append('location', JSON.stringify(fallbackLocation));

    setTimeout(async () => {
      try {
        const res = await api.post('/produce', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data.success) {
          setGradingResult(res.data.data);
          setGradingStep(4); // grading finished
        }
      } catch (err) {
        alert(err.response?.data?.message || 'AI Grading failed.');
        setLoading(false);
        setGradingStep(0);
      }
    }, 4500);
  };

  return (
    <div className="flex-grow bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 relative">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1 bg-brand-emerald/10 border border-brand-emerald/20 px-3 py-1 rounded-full text-brand-emerald text-xs font-bold font-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini-AI Engine Connected</span>
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-earth tracking-tight">
            List Rescued Produce
          </h1>
          <p className="text-gray-500 text-sm font-accent max-w-lg mx-auto">
            Upload visual images of your Grade B/C yields to calculate direct discounts and find commercial buyers.
          </p>
        </div>

        {/* 1. Voice Assist Trigger Box */}
        <div className="p-5 bg-brand-clay/30 border border-brand-sand rounded-3xl flex items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-brand-earth flex items-center gap-2">
              <Mic className="w-4.5 h-4.5 text-brand-emerald" />
              <span>Voice-Assisted Field Input</span>
            </h3>
            <p className="text-xs text-gray-500 font-accent max-w-md">
              {voiceText || "Click microphone and speak like: 'Tomatoes twenty kilograms, price thirty rupees'."}
            </p>
          </div>
          <button
            type="button"
            onClick={startSpeechRecognition}
            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow transition-all duration-300 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-white hover:bg-brand-clay/40 text-brand-earth border border-brand-sand'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-brand-emerald" />}
          </button>
        </div>

        {/* 2. Main Listing Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Drag and Drop */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-2">Upload Visual Crop Photograph</label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-brand-sand hover:border-brand-emerald/40 bg-brand-cream/30 hover:bg-brand-cream/60 transition-all rounded-3xl aspect-[3/1] flex flex-col items-center justify-center cursor-pointer p-4 relative overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="crop preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-10 h-10 text-brand-emerald mx-auto" />
                  <p className="text-xs font-bold text-brand-earth">Drag & Drop crop image here or click to browse</p>
                  <p className="text-[10px] text-gray-400">Supports PNG, JPG, JPEG up to 10MB</p>
                </div>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Produce Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Tomatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Quantity (in Kilograms)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Expected Retail Price (₹ per kg)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 40"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Harvest Date</label>
              <input 
                type="date" 
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>
          
          {/* Dynamic Live Pricing Summary Box */}
          {(quantity || expectedPrice) && (
            <div className="p-5 bg-brand-cream/50 border border-brand-sand rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm shadow-inner transition-all duration-300">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Price per kg</span>
                <span className="text-lg font-extrabold font-mono text-brand-emerald">
                  ₹{parseFloat(expectedPrice || 0).toFixed(2)} / kg
                </span>
              </div>
              <div className="hidden sm:block text-xl text-brand-emerald/30">×</div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Quantity</span>
                <span className="text-lg font-extrabold font-mono text-brand-earth">
                  {parseFloat(quantity || 0)} kg
                </span>
              </div>
              <div className="hidden sm:block text-xl text-brand-emerald/30">=</div>
              <div className="text-center sm:text-right bg-brand-emerald/10 border border-brand-emerald/20 px-5 py-2.5 rounded-2xl min-w-[160px]">
                <span className="text-[9px] text-brand-emerald font-bold uppercase block tracking-widest">Total Estimated Price</span>
                <span className="text-xl font-extrabold font-mono text-brand-emerald">
                  ₹{(parseFloat(quantity || 0) * parseFloat(expectedPrice || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase font-accent mb-1.5">Quality Notes & Imperfections (Optional)</label>
            <textarea 
              rows="3"
              placeholder="e.g. Minor surface spots, irregular sizes but highly fresh inside."
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 font-display font-semibold text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-brand-sage" />
                <span>Submit & AI Grade Yields</span>
              </>
            )}
          </button>

        </form>

        {/* 3. AI grading HUD Processing Overlay */}
        <AnimatePresence>
          {loading && (
            <div className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-brand-sand shadow-premium max-w-md w-full p-8 rounded-3xl text-center space-y-6"
              >
                
                {gradingStep < 4 ? (
                  <div className="space-y-4 py-8">
                    <Loader2 className="w-12 h-12 text-brand-emerald animate-spin mx-auto" />
                    
                    <h3 className="font-display font-extrabold text-xl text-brand-earth">Gemini AI Inspecting Yields</h3>
                    <p className="text-gray-500 text-xs font-accent">Evaluating pixel skin blemishes and deformity ratios...</p>
                    
                    <div className="space-y-2.5 pt-4 text-xs font-bold font-accent text-left max-w-xs mx-auto">
                      <p className={gradingStep >= 1 ? "text-brand-emerald" : "text-gray-300"}>
                        {gradingStep >= 1 ? "✓" : "○"} Uploading crop media buffers
                      </p>
                      <p className={gradingStep >= 2 ? "text-brand-emerald" : "text-gray-300"}>
                        {gradingStep >= 2 ? "✓" : "○"} Analyzing surface blemishes
                      </p>
                      <p className={gradingStep >= 3 ? "text-brand-emerald" : "text-gray-300"}>
                        {gradingStep >= 3 ? "✓" : "○"} Matching hex zonal demand
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-brand-sage/40 rounded-full flex items-center justify-center mx-auto text-brand-emerald">
                      <CheckCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-2xl text-brand-earth">Crop Graded!</h3>
                      <p className="text-xs text-gray-500 font-accent">Gemini AI inspection results returned</p>
                    </div>

                    <div className="p-4 bg-brand-clay/30 border border-brand-sand rounded-2xl text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-brand-earth">{gradingResult?.name}</span>
                        <span className="text-xs font-extrabold bg-brand-amber text-white px-2.5 py-0.5 rounded">
                          {gradingResult?.aiGrading?.grade}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed font-accent">
                        {gradingResult?.aiGrading?.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 text-xs border-t border-brand-sand font-accent">
                        <span>Original Expected: <strong>₹{gradingResult?.originalPrice}/kg</strong></span>
                        <span className="text-brand-emerald">Rescued Price: <strong>₹{gradingResult?.discountedPrice}/kg</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setLoading(false);
                        setGradingStep(0);
                        navigate('/dashboard/farmer');
                      }}
                      className="w-full btn-primary py-3 flex items-center justify-center font-display"
                    >
                      <span>Proceed to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default UploadProduce;
