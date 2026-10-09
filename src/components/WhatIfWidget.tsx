"use client";

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Battery, Sun, Zap, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

export function WhatIfWidget() {
  const { emsState } = useSimulation();
  
  const [batteryMwh, setBatteryMwh] = useState(emsState?.battery?.ratedCapacityMwh || 2.0);
  const [solarMw, setSolarMw] = useState(2.5); // base plant size
  const [loadMw, setLoadMw] = useState(2.0); // base load
  
  const results = useMemo(() => {
    // Heuristics for the what-if impact
    const baseBattery = 2.0;
    const baseSolar = 2.5;
    const baseGridTariff = 9.4; // peak tariff
    
    // Calculate deltas
    const addedSolar = solarMw - baseSolar;
    const addedBattery = batteryMwh - baseBattery;
    
    // Impact on grid import during peak
    const dailyGridPeakReductionMwh = Math.max(0, Math.min(addedBattery + (addedSolar * 0.2), loadMw * 4)); 
    const dailySavingsIncrease = dailyGridPeakReductionMwh * baseGridTariff * 1000; // rough approx Rs
    
    const totalInvestment = (Math.max(addedSolar, 0) * 40000000) + (Math.max(addedBattery, 0) * 25000000); // 4Cr/MW solar, 2.5Cr/MWh BESS
    const annualSavings = dailySavingsIncrease * 330;
    const roiYears = totalInvestment > 0 && annualSavings > 0 ? (totalInvestment / annualSavings).toFixed(1) : (totalInvestment === 0 ? '0' : 'N/A');
    
    const chartData = [
      { time: '00:00', original: 2000, projected: Math.max(0, 2000 - addedBattery*100) },
      { time: '06:00', original: 2200, projected: Math.max(0, 2200 - (addedBattery*100 + addedSolar*50)) },
      { time: '12:00', original: 0, projected: 0 },
      { time: '18:00', original: 4500, projected: Math.max(0, 4500 - (addedBattery*500 + addedSolar*100)) },
      { time: '23:59', original: 2500, projected: Math.max(0, 2500 - addedBattery*200) },
    ];
    
    return {
      dailySavingsIncrease,
      annualSavings,
      totalInvestment,
      roiYears,
      chartData,
      selfConsumptionBoost: Math.min(100, 85 + (addedBattery * 2) + (addedSolar * 1)),
      gridDependenceDrop: Math.min(100, (addedBattery * 5) + (addedSolar * 3))
    };
  }, [batteryMwh, solarMw, loadMw]);

  return (
    <div className="flex flex-col gap-4 mt-2 mb-2 w-full max-w-sm font-sans animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <Info size={16} /> Interactive What-If Analysis
        </div>
        
        <div className="p-4 space-y-5">
          <div className="space-y-4">
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><Battery size={14} className="text-blue-500"/> Battery Capacity</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{batteryMwh.toFixed(1)} MWh</span>
              </div>
              <input type="range" min="0" max="10" step="0.5" value={batteryMwh} onChange={(e) => setBatteryMwh(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><Sun size={14} className="text-orange-500"/> Solar PV</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">{solarMw.toFixed(1)} MW</span>
              </div>
              <input type="range" min="0" max="10" step="0.5" value={solarMw} onChange={(e) => setSolarMw(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            
            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-500"/> Factory Load</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">{loadMw.toFixed(1)} MW</span>
              </div>
              <input type="range" min="0.5" max="5" step="0.1" value={loadMw} onChange={(e) => setLoadMw(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
             <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center">
                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Proj. Investment</div>
                <div className="text-lg font-black text-gray-900">₹{(results.totalInvestment/10000000).toFixed(2)}<span className="text-xs text-gray-500 ml-0.5">Cr</span></div>
             </div>
             <div className="bg-emerald-50 shadow-sm p-3 rounded-xl border border-emerald-100 flex flex-col justify-center items-center text-center">
                <div className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Est. ROI</div>
                <div className="text-lg font-black text-emerald-700">{results.roiYears}<span className="text-xs text-emerald-600/80 ml-0.5">Yrs</span></div>
             </div>
          </div>

          <div className="h-32 w-full mt-2 bg-gray-50/30 rounded-xl p-2 border border-gray-100">
            <div className="text-[10px] text-gray-500 font-bold mb-1 ml-1 text-center uppercase tracking-wider">Peak Grid Import Cost (₹)</div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" name="Baseline" dataKey="original" stroke="#9ca3af" fill="none" strokeDasharray="4 4" strokeWidth={2} />
                <Area type="monotone" name="With Investment" dataKey="projected" stroke="#10b981" fill="url(#colorProjected)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900 leading-relaxed shadow-inner">
             <strong>Analysis Report:</strong> By modifying these parameters, your system's self-consumption ratio is boosted to <span className="font-bold text-indigo-700 bg-indigo-100 px-1 rounded">{results.selfConsumptionBoost.toFixed(1)}%</span>. Your overall dependence on the grid will drop by <span className="font-bold text-indigo-700 bg-indigo-100 px-1 rounded">{results.gridDependenceDrop.toFixed(1)}%</span>. 
             This configuration yields an additional estimated annual savings of <strong className="text-emerald-700">₹{(results.annualSavings/100000).toFixed(1)} Lakhs</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
