import React from 'react';
import { Eye, Map, Clock, ShieldAlert, CreditCard } from 'lucide-react';

const Features = () => {
  const list = [
    {
      icon: <Eye className="w-8 h-8 text-brand-emerald" />,
      title: "Gemini Vision AI Grading",
      desc: "Upload produce photographs directly from the field. Our system sends images to the Gemini API to detect visual blemishes, skin spots, shape deformities, and color uniformities. Instantly classifies yields into Grade A, B, C, or Rotten."
    },
    {
      icon: <Map className="w-8 h-8 text-brand-amber" />,
      title: "Hexagonal Zoning Model",
      desc: "To prevent regional waste imbalances and excessive shipping emissions, we map coordinates into discrete, virtual hexagonal zones. Buyers can filter listings within their immediate active zone, optimizing routes."
    },
    {
      icon: <Clock className="w-8 h-8 text-sky-500" />,
      title: "Freshness Priority Dispatch",
      desc: "Older harvests are automatically ranked higher in search listings. This ensures near-overripe but perfectly edible produce is rescued first, dramatically lowering transit decay risks."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
      title: "Automated Waste Routing",
      desc: "Any produce graded as 'Rotten/Unusable' is instantly flagged and redirected to licensed regional composting processing units. Organic Grade C yield is prioritized for nearby animal care sanctuaries."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-violet-500" />,
      title: "Integrated Razorpay & Wallet",
      desc: "Enjoy seamless, instant payments. Commercial buyers can securely execute purchases via simulated Razorpay cards, or draw directly from their startup wallet balances, instantly updating farmer balances."
    }
  ];

  return (
    <div className="flex-grow bg-brand-cream/30 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-emerald font-accent font-bold uppercase tracking-wider text-sm">
            ⚙️ ENGINE CORE CAPABILITIES
          </span>
          <h1 className="font-display font-extrabold text-4xl text-brand-earth tracking-tight">
            Designed for Zero-Waste Logistics
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base font-accent">
            KrishiSamadhan integrates cutting-edge technology to turn carbon waste into community value.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-8">
          {list.map((item, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-white border border-brand-sand shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-14 h-14 bg-brand-clay/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-xl text-brand-earth">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-accent">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Features;
