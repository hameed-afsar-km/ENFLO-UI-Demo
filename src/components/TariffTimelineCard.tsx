"use client";

import React from 'react';
import { useSimulation, getTariffTier } from '@/context/SimulationContext';
import { Clock, IndianRupee, Sun, Zap, Info, TrendingDown, TrendingUp, HelpCircle } from 'lucide-react';

export function TariffTimelineCard() {
  const { emsState } = useSimulation();
  const { tariffs } = emsState;
  const { solarGenerationMw } = emsState.currentPower;
  
  const currentTariff = tariffs.current;
  const tierInfo = getTariffTier(currentTariff);

  return (
    <div className="solid-card p-5 h-full flex flex-col group bg-white justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee size={16} className="text-emerald-500" /> Dynamic Grid Tariff
              </h2>
              <div className="tooltip-trigger">
                <HelpCircle size={15} />
                <div className="tooltip-content w-64">
                  <strong className="block mb-1 text-white font-bold">Dynamic Solar Pricing:</strong>
                  Real-time electricity tariff inversely indexed to solar supply. Abundant solar generation drives wholesale prices down (off-peak); zero solar triggers peak rates.
                </div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Solar-Indexed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Sun size={13} className="text-amber-500" />
              <span>Solar Supply:</span>
              <strong className="text-gray-900 font-bold">{solarGenerationMw.toFixed(2)} MW</strong>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Tariff</div>
            <div className={`text-xl font-black ${
              tierInfo.tier === 'off-peak' ? 'text-emerald-600' :
              tierInfo.tier === 'standard' ? 'text-blue-600' : 'text-rose-600'
            }`}>
              ₹{currentTariff.toFixed(2)}<span className="text-xs font-semibold text-gray-400">/kWh</span>
            </div>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${tierInfo.badgeClass}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Dynamic solar-to-tariff relation bar */}
        <div className="mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tierInfo.tier === 'off-peak' ? (
              <TrendingDown size={14} className="text-emerald-500 shrink-0" />
            ) : tierInfo.tier === 'peak' ? (
              <TrendingUp size={14} className="text-rose-500 shrink-0" />
            ) : (
              <Zap size={14} className="text-blue-500 shrink-0" />
            )}
            <span className="leading-tight">{tierInfo.description}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 ml-2">
            Merit-Order
          </span>
        </div>
      </div>
      
      <div className="flex flex-col justify-end pt-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1"><Clock size={12} /> Upcoming Diurnal Tariff Schedule</span>
          <span className="text-[9px] text-gray-400 font-normal">Indexed to Sun Curve</span>
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
                  <div className="text-gray-300 text-[9px]">{period.type === 'low' ? 'Peak Solar Supply' : period.type === 'high' ? 'Zero Solar / Evening Peakers' : 'Daytime Moderate Solar'}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-2 px-1 text-[10px] font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span>Solar Valley (≤ ₹5.00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span>Standard (₹5.00 - ₹7.20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span>Peak Rate (&gt; ₹7.20)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
