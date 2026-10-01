"use client";

import React from 'react';
import { BrainCircuit, TrendingDown, ArrowRight, Clock } from 'lucide-react';

export function EmsOptimizerCard() {
  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit size={16} /> AI EMS Optimizer & Economics
        </h2>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 justify-between">
        <div className="bg-[#eefcf6] p-4 rounded-xl border border-[#c3f2d7]">
          <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Current AI Decision</div>
          <div className="font-bold text-base text-gray-900 mb-1">Charging Battery from Grid</div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <strong>Reasoning:</strong> Grid tariff is currently at a daily minimum (₹3.5/kWh). AI predicts a load peak at 18:00 when tariff reaches ₹8.2/kWh. Pre-charging to maximize arbitrage savings.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wide">Savings Today</div>
            <div className="text-xl font-bold text-emerald-500 flex items-center gap-1.5">
              ₹12,450 <TrendingDown size={16} />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">vs. Baseline (₹34,200)</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wide">Next Action</div>
            <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-blue-500"/> 18:00
            </div>
            <div className="text-[10px] text-gray-600 flex items-center gap-1">
              Discharge <ArrowRight size={10}/> Factory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
