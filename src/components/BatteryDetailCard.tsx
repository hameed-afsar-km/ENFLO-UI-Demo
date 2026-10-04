"use client";

import React from 'react';
import { BatteryCharging, Activity, Thermometer, Zap, ShieldAlert } from 'lucide-react';
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
    <div className="solid-card p-6 flex flex-col h-full group bg-white">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <BatteryCharging size={16} className="text-emerald-500"/> BESS Status
        </h2>
        <div className={`px-2 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide flex items-center gap-1 ${getStatusColor()}`}>
          {battery.state === 'Charging' && <Zap size={10} />}
          {battery.state === 'Reserve' && <ShieldAlert size={10} />}
          {battery.state}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-6 mt-2 relative">
         <div className="relative w-32 h-14 border-4 border-gray-300 rounded-lg p-1 flex items-center bg-gray-50 overflow-hidden">
           {/* Battery Nipple */}
           <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-gray-300 rounded-r-sm"></div>
           
           {/* Min Reserve Line */}
           <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-orange-400 z-20" style={{ left: `${battery.minReserve}%` }}>
             <div className="absolute -top-4 -translate-x-1/2 text-[8px] font-bold text-orange-500 whitespace-nowrap bg-white px-1">Min {battery.minReserve}%</div>
           </div>
           
           {/* Fill */}
           <div 
             className={`h-full rounded-sm transition-all duration-1000 ${battery.soc <= battery.minReserve ? 'bg-orange-400' : 'bg-emerald-400'}`} 
             style={{ width: `${battery.soc}%` }}
           ></div>
           
           <div className="absolute inset-0 flex items-center justify-center z-10 drop-shadow-md">
             <span className="text-xl font-black text-white">{battery.soc}%</span>
           </div>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">State</div>
          <div className="text-xs font-bold text-gray-900">
            {battery.state === 'Charging' ? `+${battery.chargePowerMw.toFixed(2)} MW` : 
             battery.state === 'Discharging' ? `-${battery.dischargePowerMw.toFixed(2)} MW` : 
             '0.00 MW'}
          </div>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Health</div>
          <div className="text-xs font-bold text-gray-900">{battery.soh}%</div>
        </div>
      </div>
    </div>
  );
}
