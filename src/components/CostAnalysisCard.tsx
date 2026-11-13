"use client";

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { IndianRupee, TrendingUp, TrendingDown, Sun, ArrowUpRight, HelpCircle, Zap, ShieldCheck } from 'lucide-react';
import { mockData } from '@/data/mock';

export function CostAnalysisCard() {
  const { emsState } = useSimulation();
  const { costProjection } = emsState;
  
  // Calculate distinct profit streams
  const solarGenMwh = mockData.energyToday.solarGenerationMwh || 9.6;
  const gridExportMwh = mockData.energyToday.gridExportMwh || 1.1;
  const avgGridTariff = 5.20; // Average grid retail replacement rate (₹/kWh)
  const exportTariff = 6.55; // Feed-in export tariff (₹/kWh)

  // 1. Generation Profit: Value of solar power generated on-site vs buying from grid
  const solarGenerationProfit = Math.round(solarGenMwh * 1000 * avgGridTariff); // ₹49,920
  
  // 2. EMS Arbitrage Profit: Net bill reduction from smart battery dispatch during peak hours
  const emsArbitrageProfit = costProjection.estimatedSavingToday || 12450; // ₹12,450
  
  // 3. Grid Export Revenue: Cash earned feeding surplus solar back into Tamil Nadu grid
  const gridExportRevenue = Math.round(gridExportMwh * 1000 * exportTariff); // ₹7,200

  // Total daily financial return / value generated
  const totalDailyProfit = solarGenerationProfit + emsArbitrageProfit + gridExportRevenue; // ₹69,570
  const savingsPercent = Math.round((emsArbitrageProfit / costProjection.baselineCostToday) * 100);

  return (
    <div className="solid-card p-5 h-full flex flex-col group bg-white justify-between">
      <div>
        {/* Header with Title and Explainer */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={16} className="text-emerald-500" /> Financial Profit & Savings
            </h2>
            <div className="tooltip-trigger">
              <HelpCircle size={15} />
              <div className="tooltip-content w-72">
                <strong className="block mb-1 text-white font-bold">What Profit is this?</strong>
                <ul className="space-y-1 text-[11px] leading-tight text-gray-200">
                  <li>• <strong>Generation Profit (₹{solarGenerationProfit.toLocaleString()}):</strong> Value of {solarGenMwh} MWh solar energy produced on-site, displacing costly grid purchases.</li>
                  <li>• <strong>EMS Arbitrage Profit (₹{emsArbitrageProfit.toLocaleString()}):</strong> Direct savings from AI battery dispatch during peak tariff periods (-{savingsPercent}% bill cut).</li>
                  <li>• <strong>Export Revenue (₹{gridExportRevenue.toLocaleString()}):</strong> Cash earned from feeding {gridExportMwh} MWh surplus solar power into the grid.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
            <TrendingUp size={11} /> +{savingsPercent}% EMS Gain
          </span>
        </div>

        {/* Total Profit Hero Metric */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Value Generated Today</div>
            <div className="text-2xl font-black text-emerald-700">₹{totalDailyProfit.toLocaleString()}</div>
          </div>
          <div className="text-right text-[11px] text-emerald-800 font-semibold space-y-0.5">
            <div>₹{solarGenerationProfit.toLocaleString()} Solar Value</div>
            <div>+ ₹{emsArbitrageProfit.toLocaleString()} EMS Savings</div>
          </div>
        </div>

        {/* 3 Pillars of Profit Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-[9px] font-bold text-gray-500 uppercase">Generation</div>
            <div className="text-xs font-black text-gray-900 mt-0.5">₹{solarGenerationProfit.toLocaleString()}</div>
            <div className="text-[9px] text-gray-400">{solarGenMwh} MWh Solar</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-[9px] font-bold text-gray-500 uppercase">Arbitrage</div>
            <div className="text-xs font-black text-emerald-600 mt-0.5">₹{emsArbitrageProfit.toLocaleString()}</div>
            <div className="text-[9px] text-gray-400">Peak Shifted</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-[9px] font-bold text-gray-500 uppercase">Export Cash</div>
            <div className="text-xs font-black text-blue-600 mt-0.5">₹{gridExportRevenue.toLocaleString()}</div>
            <div className="text-[9px] text-gray-400">{gridExportMwh} MWh Sold</div>
          </div>
        </div>
      </div>
      
      {/* Bill Reduction Comparison */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase mr-1.5">Without EMS:</span>
            <span className="text-gray-400 line-through font-medium">₹{costProjection.baselineCostToday.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Optimized:</span>
            <span className="font-extrabold text-gray-900">₹{costProjection.optimizedCostToday.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
              -₹{emsArbitrageProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}