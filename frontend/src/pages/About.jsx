import React from 'react';
import { motion } from 'framer-motion';
import { Target, Leaf, Heart, Eye } from 'lucide-react';

const About = () => {
  return (
    <div className="flex-grow bg-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-emerald font-accent font-bold uppercase tracking-wider text-sm">
            🌱 OUR STORY & CORE MISSION
          </span>
          <h1 className="font-display font-extrabold text-4xl text-brand-earth tracking-tight">
            Restoring Value to Imperfect Produce
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base font-accent">
            We are dedicated to building a zero-waste agritech ecosystem that connects smallholder farms with conscious commercial markets.
          </p>
        </div>

        {/* Vision Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="font-display font-extrabold text-2xl text-brand-earth">
              The Aesthetic Dilemma of Agriculture
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-accent">
              Up to 30% of agricultural produce worldwide never leaves the farm because it fails strict, superficial supermarket appearance standards. A curved cucumber, a spotted apple, or an undersized potato is completely nutritious, but is routinely discarded or left to rot in open fields.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed font-accent">
              This waste is an economic tragedy for hard-working farmers and an ecological disaster, generating methane gas and throwing away the precious water and labor invested in growing crops.
            </p>
          </div>
          <div className="bg-brand-clay/30 border border-brand-sand p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <h4 className="font-display font-bold text-lg text-brand-earth">The AgroBridge Solution</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-accent">
              Our platform operates as a secure, decentralized bridge. We integrate advanced Gemini Vision AI to grade visual produce flaws, advise fair discount structures, and matches farmers with restaurants, food manufacturers, animal care shelters, and compost sites.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-sand shadow-sm space-y-4">
            <Target className="w-8 h-8 text-brand-amber" />
            <h4 className="font-display font-bold text-lg text-brand-earth">Farmer Income Boost</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              We create an instant secondary revenue pipeline, helping farmers monetize produce that would otherwise be rejected and wasted.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-sand shadow-sm space-y-4">
            <Leaf className="w-8 h-8 text-brand-emerald" />
            <h4 className="font-display font-bold text-lg text-brand-earth">Carbon Offset Reduction</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              By routing organic waste away from landfills and open rotting dumps, we prevent thousands of tons of methane and CO2 greenhouse gas emissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-sand shadow-sm space-y-4">
            <Heart className="w-8 h-8 text-sky-400" />
            <h4 className="font-display font-bold text-lg text-brand-earth">Ecosystem Integration</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              We leverage regional hexagonal zoning, prioritizing local matching to minimize transport logistics and emissions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
