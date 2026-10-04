"use client";

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { Clock, IndianRupee } from 'lucide-react';

export function TariffTimelineCard() {
  const { emsState } = useSimulation();
  const { tariffs } = emsState;

  return (
    <div className="solid-card p-5 h-full flex flex-col group bg-white">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee size={16} className="text-emerald-500" /> Grid Tariff
        </h2>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current</div>
          <div className="text-lg font-black text-emerald-600">₹{tariffs.current.toFixed(2)}/kWh</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Clock size={12} /> Upcoming Periods
        </div>
        <div className="flex w-full h-8 rounded-lg overflow-hidden border border-gray-200">
          {tariffs.timeline.map((period: any, idx: number) => {
            const isHigh = period.type === 'high';
            const isLow = period.type === 'low';
            return (
              <div 
                key={idx} 
                className={`flex-1 flex flex-col items-center justify-center border-r last:border-0 border-white/20 
                  ${isHigh ? 'bg-red-400' : isLow ? 'bg-green-400' : 'bg-blue-400'} 
                  text-white relative group`}
              >
                <span className="text-[10px] font-bold z-10">{period.time}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                   ₹{period.price.toFixed(2)}/kWh ({period.type.toUpperCase()})
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 px-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-[9px] font-bold text-gray-500 uppercase">Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
