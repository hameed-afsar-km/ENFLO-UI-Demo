import React from 'react';
import { mockData } from '@/data/mock';
import Image from 'next/image';
import { Zap, Factory, Battery, PlugZap, HelpCircle } from 'lucide-react';

export function CurrentPowerCard() {
  const { solarGenerationMw, factoryLoadMw, gridImportMw } = mockData.currentPower;
  const { soc: batterySoc } = mockData.battery;
  
  return (
    <div className="glass-card p-5 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Power Overview</h2>
          <div className="tooltip-trigger">
            <HelpCircle size={18} />
            <div className="tooltip-content">
              <strong>Answers:</strong> How much solar is being generated and where is it going?
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="mb-4 mt-1">
            <div className="text-5xl lg:text-6xl font-bold text-primary-text mb-2 tracking-tight flex items-baseline gap-2">
              {solarGenerationMw} <span className="text-2xl text-accent-dark font-medium">MW</span>
            </div>
            <div className="text-base text-secondary-text font-medium flex items-center gap-1.5">
              <Zap size={18} className="text-accent-dark" />
              Solar generation
            </div>
          </div>
          
          <div className="w-48 h-32 md:w-64 md:h-40 relative hidden sm:block -mr-2 -mt-2">
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
          <div className="bg-surface/60 backdrop-blur-sm p-4 rounded-xl border border-border/50">
            <div className="text-secondary-text text-xs font-semibold mb-1 flex items-center gap-1"><Factory size={14}/> Factory</div>
            <div className="text-xl lg:text-2xl font-bold text-primary-text">{factoryLoadMw} <span className="text-xs font-medium text-secondary-text">MW</span></div>
            <div className="text-xs text-secondary-text mt-0.5">Current load</div>
          </div>
          
          <div className="bg-surface/60 backdrop-blur-sm p-4 rounded-xl border border-border/50">
            <div className="text-secondary-text text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1"><PlugZap size={14}/> Grid</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">₹3.5/kWh</span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-primary-text">{gridImportMw} <span className="text-xs font-medium text-secondary-text">MW</span></div>
            <div className="text-xs text-secondary-text mt-0.5">Import</div>
          </div>
          
          <div className="bg-surface/60 backdrop-blur-sm p-4 rounded-xl border border-border/50">
            <div className="text-secondary-text text-xs font-semibold mb-1 flex items-center gap-1"><Battery size={14}/> Battery</div>
            <div className="text-xl lg:text-2xl font-bold text-primary-text">{batterySoc} <span className="text-xs font-medium text-secondary-text">%</span></div>
            <div className="text-xs text-secondary-text mt-0.5">SOC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
