"use client";

import React from 'react';
import { useSimulation, getTariffTier } from '@/context/SimulationContext';
import { Clock, IndianRupee, Sun, HelpCircle } from 'lucide-react';

export function TariffTimelineCard() {
  const { emsState } = useSimulation();
  const { tariffs } = emsState;
  const { solarGenerationMw } = emsState.currentPower;
  
  const currentTariff = tariffs.current;
  const tierInfo = getTariffTier(currentTariff);

  return (
    <div className="solid-card p-6 h-full flex flex-col group bg-white justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee size={16} className="text-emerald-500" /> Dynamic Grid Tariff
              </h2>
              <div className="tooltip-trigger">
                <HelpCircle size={15} />
                <div className="tooltip-content w-64">
                  <strong className="block mb-1 text-white font-bold">Dynamic Solar Pricing:</strong>
                  Real-time electricity tariff inversely indexed to solar supply. Abundant daytime solar lowers wholesale rates; zero solar drives peak tariffs.
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Sun size={13} className="text-amber-500" />
              <span>Solar Supply:</span>
              <strong className="text-gray-900 font-bold">{solarGenerationMw.toFixed(2)} MW</strong>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-black ${
              tierInfo.tier === 'off-peak' ? 'text-emerald-600' :
              tierInfo.tier === 'standard' ? 'text-blue-600' : 'text-rose-600'
            }`}>
              ₹{currentTariff.toFixed(2)}<span className="text-xs font-semibold text-gray-400">/kWh</span>
            </div>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 ${tierInfo.badgeClass}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Timeline Schedule */}
      <div className="flex flex-col justify-end pt-4 border-t border-gray-100">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock size={13} className="text-gray-400" />
          <span>Upcoming Tariff Schedule</span>
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
                  text-white relative group cursor-default`}
              >
                <span className="text-[10px] font-bold z-10">{period.time}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  <div>₹{period.price.toFixed(2)}/kWh ({period.type.toUpperCase()})</div>
                  <div className="text-gray-300 text-[9px]">{period.type === 'low' ? 'Peak Solar Supply' : period.type === 'high' ? 'Zero Solar / Peakers' : 'Standard Daytime'}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between mt-2.5 px-0.5 text-[11px] font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span>Low (≤ ₹5.00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span>Standard (₹5.00 - ₹7.20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span>Peak (&gt; ₹7.20)</span>
          </div>
        </div>
      </div>
    </div>
  );
}