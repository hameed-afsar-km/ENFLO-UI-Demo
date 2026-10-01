"use client";

import React from 'react';
import { BatteryCharging, Activity, Thermometer } from 'lucide-react';

export function BatteryDetailCard() {
  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
          <BatteryCharging size={16} /> BESS Health
        </h2>
        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-200 uppercase tracking-wide">
          Charging
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-[10px] text-gray-500 font-semibold mb-1 flex items-center gap-1 uppercase tracking-wide"><Activity size={12}/> SOH</div>
          <div className="text-2xl font-bold text-gray-900">98.2<span className="text-sm text-gray-500 font-medium">%</span></div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-semibold mb-1 flex items-center gap-1 uppercase tracking-wide"><BatteryCharging size={12}/> SOC</div>
          <div className="text-2xl font-bold text-gray-900">68.0<span className="text-sm text-gray-500 font-medium">%</span></div>
        </div>
      </div>
      
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-600">Charge Rate</div>
          <div className="text-xs font-bold text-emerald-500">+1.2 MW</div>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-600">Cycles</div>
          <div className="text-xs font-bold text-gray-900">452</div>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-600 flex items-center gap-1"><Thermometer size={12}/> Temp</div>
          <div className="text-xs font-bold text-gray-900">28°C</div>
        </div>
      </div>
    </div>
  );
}
