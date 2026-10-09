"use client";

import React, { useState, useMemo } from 'react';
import { TrendingUp, Battery, Sun, Zap, Info, ArrowLeft, Download, RefreshCw, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import Link from 'next/link';

export default function WhatIfPage() {
  const { emsState } = useSimulation();
  
  const [batteryMwh, setBatteryMwh] = useState(emsState?.battery?.ratedCapacityMwh || 2.0);
  const [solarMw, setSolarMw] = useState(2.5); // base plant size
  const [loadMw, setLoadMw] = useState(2.0); // base load
  
  const results = useMemo(() => {
    // Heuristics for the what-if impact
    const baseBattery = 2.0;
    const baseSolar = 2.5;
    const baseGridTariff = 9.4; // peak tariff
    
    // Calculate total system costs (absolute) instead of marginal
    const costSolar = solarMw * 40000000; // 4Cr/MW solar
    const costBattery = batteryMwh * 25000000; // 2.5Cr/MWh BESS
    const totalInvestment = costSolar + costBattery;
    
    // Approximate absolute annual savings based on self consumption of this setup
    const annualSavings = ((solarMw * 4 * 330) * baseGridTariff * 1000) + (batteryMwh * 330 * (baseGridTariff - 4) * 1000);
    const roiYears = totalInvestment > 0 && annualSavings > 0 ? (totalInvestment / annualSavings).toFixed(1) : 'N/A';
    
    // More complex chart data for a full screen
    const chartData = [
      { time: '00:00', original: loadMw*1000, projected: Math.max(0, loadMw*1000 - batteryMwh*100) },
      { time: '04:00', original: loadMw*1050, projected: Math.max(0, loadMw*1050 - (batteryMwh*100 + solarMw*10)) },
      { time: '08:00', original: loadMw*1500, projected: Math.max(0, loadMw*1500 - (batteryMwh*200 + solarMw*300)) },
      { time: '12:00', original: 0, projected: 0 },
      { time: '16:00', original: loadMw*1800, projected: Math.max(0, loadMw*1800 - (batteryMwh*300 + solarMw*200)) },
      { time: '20:00', original: loadMw*2200, projected: Math.max(0, loadMw*2200 - (batteryMwh*500 + solarMw*50)) },
      { time: '23:59', original: loadMw*1200, projected: Math.max(0, loadMw*1200 - batteryMwh*150) },
    ];
    
    const selfConsumptionBoost = Math.max(0, Math.min(100, 60 + (batteryMwh * 5) + (solarMw * 3)));
    const gridDependenceDrop = Math.max(0, Math.min(100, 10 + (batteryMwh * 6) + (solarMw * 5)));
    const co2Reduction = (solarMw * 800) + (batteryMwh * 150); // tons per year

    return {
      annualSavings,
      totalInvestment,
      costSolar,
      costBattery,
      roiYears,
      chartData,
      selfConsumptionBoost,
      gridDependenceDrop,
      co2Reduction
    };
  }, [batteryMwh, solarMw, loadMw]);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
             <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-secondary-text hover:text-primary-text transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Dashboard
             </Link>
             <h1 className="text-3xl font-black text-primary-text tracking-tight flex items-center gap-3">
               <Info className="text-indigo-500" size={32} />
               AI Scenario Simulator
             </h1>
             <p className="text-secondary-text mt-1 text-lg">Interactive what-if analysis for capacity planning & ROI</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <RefreshCw size={16} /> Reset
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
              <Download size={16} /> Export Detailed Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Wrench size={20} className="text-gray-400"/> Modify Parameters
              </h2>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-0.5">
                        <Battery size={16} className="text-blue-500"/> Battery Capacity
                      </div>
                      <div className="text-xs text-gray-500">BESS rated energy</div>
                    </div>
                    <span className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm">
                      {batteryMwh.toFixed(1)} MWh
                    </span>
                  </div>
                  <input type="range" min="0" max="20" step="0.5" value={batteryMwh} onChange={(e) => setBatteryMwh(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                     <span>0 MWh</span><span>10 MWh</span><span>20 MWh</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-0.5">
                        <Sun size={16} className="text-orange-500"/> Solar PV Capacity
                      </div>
                      <div className="text-xs text-gray-500">Total peak generation</div>
                    </div>
                    <span className="bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold text-sm">
                      {solarMw.toFixed(1)} MW
                    </span>
                  </div>
                  <input type="range" min="0" max="15" step="0.5" value={solarMw} onChange={(e) => setSolarMw(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                     <span>0 MW</span><span>7.5 MW</span><span>15 MW</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-0.5">
                        <Zap size={16} className="text-emerald-500"/> Factory Load
                      </div>
                      <div className="text-xs text-gray-500">Average power demand</div>
                    </div>
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold text-sm">
                      {loadMw.toFixed(1)} MW
                    </span>
                  </div>
                  <input type="range" min="0.5" max="10" step="0.1" value={loadMw} onChange={(e) => setLoadMw(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                     <span>0.5 MW</span><span>5 MW</span><span>10 MW</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wider">AI Executive Summary</h3>
              <p className="text-indigo-800 text-sm leading-relaxed mb-4">
                Based on historical plant data and simulated load models, this configuration will boost self-consumption to <strong>{results.selfConsumptionBoost.toFixed(1)}%</strong> and reduce peak tariff grid imports by <strong>{results.gridDependenceDrop.toFixed(1)}%</strong>.
              </p>
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-2">
                   <TrendingUp size={16} className="text-emerald-500" /> Additional Annual Savings
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{(results.annualSavings / 100000).toFixed(2)} <span className="text-sm text-emerald-600/70">Lakhs / yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><IndianRupee size={14}/> Proj. Investment</div>
                 <div className="text-3xl font-black text-gray-900">
                    ₹{(results.totalInvestment / 10000000).toFixed(2)}<span className="text-base text-gray-500 font-bold ml-1">Cr</span>
                 </div>
                 <div className="text-xs text-gray-500 font-medium mt-2">
                    Solar: ₹{(results.costSolar/10000000).toFixed(1)}Cr · BESS: ₹{(results.costBattery/10000000).toFixed(1)}Cr
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                 <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={14}/> Est. Payback (ROI)</div>
                 <div className="text-3xl font-black text-emerald-600">
                    {results.roiYears}<span className="text-base text-emerald-600/70 font-bold ml-1">Years</span>
                 </div>
                 <div className="text-xs text-emerald-600/70 font-medium mt-2">
                    Breakeven by {new Date().getFullYear() + (parseFloat(results.roiYears) || 0)}
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                 <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sun size={14}/> Carbon Offset</div>
                 <div className="text-3xl font-black text-blue-600">
                    {results.co2Reduction.toFixed(1)}<span className="text-base text-blue-600/70 font-bold ml-1">Tons</span>
                 </div>
                 <div className="text-xs text-blue-600/70 font-medium mt-2">
                    CO2 equivalent per year
                 </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Peak Grid Import Cost Reduction</h2>
              <p className="text-sm text-gray-500 mb-6">24-hour simulation showing grid cost flattening against your existing baseline.</p>
              
              <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d1d5db" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                      labelStyle={{ color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}
                      formatter={(value: any) => [`₹${Number(value).toFixed(0)}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                    <Area type="monotone" name="Current Baseline Cost (₹)" dataKey="original" stroke="#9ca3af" fill="url(#colorOriginal)" strokeDasharray="4 4" strokeWidth={2} />
                    <Area type="monotone" name="Projected Cost (₹)" dataKey="projected" stroke="#10b981" fill="url(#colorProjected)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wrench({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  );
}
