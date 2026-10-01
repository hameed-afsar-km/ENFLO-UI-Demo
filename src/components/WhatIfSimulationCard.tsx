"use client";

import React, { useState } from 'react';
import { Sliders, Calculator } from 'lucide-react';

export function WhatIfSimulationCard() {
  const [capacity, setCapacity] = useState(5); // Baseline 5MWh
  
  const additionalSavings = (capacity - 5) * 850000;
  
  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} /> What-If Simulator
        </h2>
      </div>
      
      <div className="flex-1 flex flex-col justify-between mt-2">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <div className="text-xs font-bold text-gray-700">Add Battery Capacity</div>
            <div className="text-lg font-black text-blue-500">{capacity} MWh</div>
          </div>
          <input 
            type="range" 
            min="2" max="20" step="1" 
            value={capacity} 
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-semibold tracking-wide">
            <span>2 MWh</span>
            <span>Current: 5 MWh</span>
            <span>20 MWh</span>
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-2 translate-y-2">
            <Calculator size={56} />
          </div>
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Projected Annual Savings</div>
          <div className="text-2xl font-black text-emerald-500 mb-1 flex items-center">
            ₹{(4500000 / 100000 + additionalSavings / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] text-gray-600 font-medium">
            {capacity > 5 ? `+₹${(additionalSavings/100000).toFixed(1)}L extra savings with ${capacity}MWh` : 'Baseline estimated savings'}
          </div>
        </div>
      </div>
    </div>
  );
}
