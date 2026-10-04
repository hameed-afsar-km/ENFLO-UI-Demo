"use client";

import React from 'react';
import Image from 'next/image';
import { useSimulation } from '@/context/SimulationContext';
import { Zap, Factory, Battery, PlugZap, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function CurrentPowerCard() {
  const { emsState } = useSimulation();
  const { solarGenerationMw, factoryLoadMw, gridImportMw, gridExportMw } = emsState.currentPower;
  const { soc: batterySoc } = emsState.battery;
  const { current: currentTariff } = emsState.tariffs;
  
  return (
    <div className="glass-card p-5 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Power Overview</h2>
          <div className="tooltip-trigger">
            <HelpCircle size={18} />
            <div className="tooltip-content">
              <strong>Answers:</strong> How much solar is being generated and what are the main loads?
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="mb-4 mt-1">
            <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2 tracking-tight flex items-baseline gap-2">
              {solarGenerationMw.toFixed(2)} <span className="text-2xl text-orange-500 font-medium">MW</span>
            </div>
            <div className="text-base text-gray-500 font-medium flex items-center gap-1.5 uppercase tracking-wide">
              <Zap size={18} className="text-orange-500" />
              Solar generation
            </div>
          </div>
          
          <div className="w-48 h-32 md:w-64 md:h-40 relative hidden sm:block -mr-2 -mt-2 pointer-events-none">
            <Image 
              src="/solar-panel.png" 
              alt="Solar Panel" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-auto pt-2">
          <div className="bg-white/80 p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Factory size={12}/> Factory Load</div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">{factoryLoadMw.toFixed(2)} <span className="text-xs font-medium text-gray-500">MW</span></div>
          </div>
          
          <div className="bg-white/80 p-4 rounded-xl border border-gray-100 shadow-sm relative">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1"><PlugZap size={12}/> Grid</span>
              <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100">₹{currentTariff.toFixed(2)}/kWh</span>
            </div>
            {gridExportMw > 0 ? (
              <div className="text-xl lg:text-2xl font-bold text-orange-500 flex items-center gap-1">
                <ArrowUpRight size={18} /> {gridExportMw.toFixed(2)} <span className="text-xs font-medium text-gray-500">MW</span>
              </div>
            ) : (
              <div className="text-xl lg:text-2xl font-bold text-purple-600 flex items-center gap-1">
                <ArrowDownRight size={18} /> {gridImportMw.toFixed(2)} <span className="text-xs font-medium text-gray-500">MW</span>
              </div>
            )}
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">{gridExportMw > 0 ? 'Exporting' : 'Importing'}</div>
          </div>
          
          <div className="bg-white/80 p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Battery size={12}/> Battery SoC</div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">{batterySoc.toFixed(1)} <span className="text-xs font-medium text-gray-500">%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
