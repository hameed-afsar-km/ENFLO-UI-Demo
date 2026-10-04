"use client";

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { IndianRupee, TrendingDown, Factory, Zap } from 'lucide-react';

export function CostAnalysisCard() {
  const { emsState } = useSimulation();
  const { costProjection } = emsState;

  return (
    <div className="solid-card p-5 h-full flex flex-col group bg-white">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee size={16} className="text-emerald-500" /> Cost Savings
        </h2>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Without EMS</div>
            <div className="text-sm font-semibold text-gray-700 line-through">₹{costProjection.baselineCostToday.toLocaleString()}</div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Optimized Cost</div>
             <div className="text-lg font-black text-gray-900">₹{costProjection.optimizedCostToday.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estimated Savings</div>
          <div className="text-sm font-black text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
             <TrendingDown size={14} /> ₹{costProjection.estimatedSavingToday.toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-orange-50/50 p-2 rounded border border-orange-100 flex flex-col items-center text-center">
            <Zap size={14} className="text-orange-500 mb-1" />
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Avoided Grid</div>
            <div className="text-xs font-bold text-gray-900">{costProjection.avoidedGridKwh} kWh</div>
          </div>
          <div className="bg-purple-50/50 p-2 rounded border border-purple-100 flex flex-col items-center text-center">
            <Factory size={14} className="text-purple-500 mb-1" />
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Peak Reduction</div>
            <div className="text-xs font-bold text-gray-900">{costProjection.peakDemandReductionMw} MW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
