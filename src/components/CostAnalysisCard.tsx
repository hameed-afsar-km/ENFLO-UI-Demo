"use client";

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { IndianRupee, HelpCircle, ArrowRight } from 'lucide-react';
import { mockData } from '@/data/mock';

export function CostAnalysisCard() {
  const { emsState } = useSimulation();
  const { costProjection } = emsState;
  
  const solarGenMwh = mockData.energyToday.solarGenerationMwh || 9.6;
  const gridExportMwh = mockData.energyToday.gridExportMwh || 1.1;
  const avgGridTariff = 5.20; // Average grid retail rate (₹/kWh)
  const exportTariff = 6.55;  // Feed-in export tariff (₹/kWh)

  // 1. Generation Profit: Value of solar power generated on-site vs buying from grid
  const solarGenerationProfit = Math.round(solarGenMwh * 1000 * avgGridTariff); // ₹49,920
  
  // 2. EMS Arbitrage Savings: Direct savings from AI battery dispatch during peak tariff hours
  const emsArbitrageProfit = costProjection.estimatedSavingToday || 12450; // ₹12,450
  
  // 3. Grid Export Revenue: Cash earned feeding surplus solar back into grid
  const gridExportRevenue = Math.round(gridExportMwh * 1000 * exportTariff); // ₹7,205

  // Total daily financial value created
  const totalDailyProfit = solarGenerationProfit + emsArbitrageProfit + gridExportRevenue;
  const savingsPercent = Math.round((emsArbitrageProfit / costProjection.baselineCostToday) * 100);

  return (
    <div className="solid-card p-6 h-full flex flex-col group bg-white justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={16} className="text-emerald-500" /> Financial Profit &amp; Savings
            </h2>
            <div className="tooltip-trigger">
              <HelpCircle size={15} />
              <div className="tooltip-content w-72">
                <strong className="block mb-1 text-white font-bold">Profit Breakdown:</strong>
                <ul className="space-y-1 text-[11px] leading-tight text-gray-200">
                  <li>• <strong>Generation (₹{solarGenerationProfit.toLocaleString()}):</strong> Value of {solarGenMwh} MWh solar energy produced on-site, displacing costly grid purchases.</li>
                  <li>• <strong>EMS Arbitrage (₹{emsArbitrageProfit.toLocaleString()}):</strong> Direct savings from AI battery dispatch during peak hours (-{savingsPercent}% bill cut).</li>
                  <li>• <strong>Export Cash (₹{gridExportRevenue.toLocaleString()}):</strong> Feed-in revenue earned from {gridExportMwh} MWh surplus solar exported.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            +{savingsPercent}% EMS Savings
          </span>
        </div>

        {/* Hero Total Metric */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Value Generated Today</div>
            <div className="text-2xl font-black text-emerald-700">₹{totalDailyProfit.toLocaleString()}</div>
          </div>
          <div className="text-xs font-semibold text-emerald-800">
            {solarGenMwh} MWh Solar + BESS Arbitrage
          </div>
        </div>

        {/* 3 Pillars Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Generation</div>
            <div className="text-sm font-extrabold text-gray-900 mt-0.5">₹{solarGenerationProfit.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{solarGenMwh} MWh Solar</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Arbitrage</div>
            <div className="text-sm font-extrabold text-emerald-600 mt-0.5">₹{emsArbitrageProfit.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Peak Avoidance</div>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Export Cash</div>
            <div className="text-sm font-extrabold text-blue-600 mt-0.5">₹{gridExportRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{gridExportMwh} MWh Sold</div>
          </div>
        </div>
      </div>
      
      {/* Bill Reduction Comparison */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-500">
          <span>Without EMS:</span>
          <span className="line-through text-gray-400 font-semibold">₹{costProjection.baselineCostToday.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Optimized:</span>
          <span className="font-extrabold text-gray-900 text-sm">₹{costProjection.optimizedCostToday.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            -₹{emsArbitrageProfit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}