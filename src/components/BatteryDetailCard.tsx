"use client";

import React from 'react';
import { BatteryCharging, Activity, Thermometer, Zap, ShieldAlert, RefreshCcw, Battery, Timer } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';

export function BatteryDetailCard() {
  const { emsState } = useSimulation();
  const { battery } = emsState;

  const getStatusColor = () => {
    switch (battery.state) {
      case 'Charging': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Discharging': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Full': return 'bg-green-50 text-green-600 border-green-200';
      case 'Reserve': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="solid-card p-5 flex flex-col h-full group bg-white">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <Battery size={16} className="text-emerald-500"/> BESS Diagnostics
        </h2>
        <div className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide flex items-center gap-1 ${getStatusColor()}`}>
          {battery.state === 'Charging' && <Zap size={10} />}
          {battery.state === 'Reserve' && <ShieldAlert size={10} />}
          {battery.state}
        </div>
      </div>
      
      {/* Visual Battery */}
      <div className="flex flex-col items-center justify-center mb-8 mt-2 relative w-full">
         <div className="relative w-full max-w-[200px] h-16 border-[3px] border-gray-300 rounded-xl p-1 flex items-center bg-gray-50 shadow-inner">
           {/* Battery Nipple */}
           <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-6 bg-gray-300 rounded-r-md"></div>
           
           {/* Min Reserve Line */}
           <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-orange-400 z-20" style={{ left: `${battery.minReserve}%` }}>
             <div className="absolute -bottom-5 -translate-x-1/2 text-[9px] font-bold text-orange-500 whitespace-nowrap">Min {battery.minReserve}%</div>
           </div>

           {/* Max Reserve Line */}
           <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-400 z-20" style={{ left: `${battery.maxReserve}%` }}>
             <div className="absolute -top-5 -translate-x-1/2 text-[9px] font-bold text-blue-500 whitespace-nowrap">Max {battery.maxReserve}%</div>
           </div>
           
           {/* Fill */}
           <div 
             className={`h-full rounded-md transition-all duration-1000 flex items-center justify-center overflow-hidden relative ${battery.soc <= battery.minReserve ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`} 
             style={{ width: `${battery.soc}%` }}
           >
             <div className="absolute inset-0 bg-white/20 w-full h-1/2 top-0"></div>
           </div>
           
           <div className="absolute inset-0 flex items-center justify-center z-10 drop-shadow-md">
             <span className="text-2xl font-black text-gray-800 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">{battery.soc}%</span>
           </div>
         </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-auto">
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><Activity size={10} className="text-blue-500"/> SOH</div>
          <div className="text-xs font-bold text-gray-900">{battery.soh}%</div>
        </div>
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><RefreshCcw size={10} className="text-purple-500"/> Cycles</div>
          <div className="text-xs font-bold text-gray-900">{battery.cycleCount}</div>
        </div>
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><Zap size={10} className="text-yellow-500"/> RTE</div>
          <div className="text-xs font-bold text-gray-900">{battery.rte}%</div>
        </div>
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><Thermometer size={10} className="text-red-500"/> Degrade</div>
          <div className="text-xs font-bold text-gray-900">{battery.degradationRate}%</div>
        </div>
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><BatteryCharging size={10} className="text-emerald-500"/> Power</div>
          <div className="text-xs font-bold text-gray-900">
            {battery.state === 'Charging' ? `+${battery.chargePowerMw?.toFixed(2) || 0} MW` : 
             battery.state === 'Discharging' ? `-${battery.dischargePowerMw?.toFixed(2) || 0} MW` : 
             '0.00 MW'}
          </div>
        </div>
        <div className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100 items-center text-center justify-center hover:bg-white transition-colors cursor-default">
          <div className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-0.5"><Timer size={10} className="text-indigo-500"/> Capacity</div>
          <div className="text-xs font-bold text-gray-900">{battery.usableEnergyMwh?.toFixed(1) || 0} / {battery.ratedCapacityMwh?.toFixed(1) || 0}</div>
        </div>
      </div>
    </div>
  );
}
