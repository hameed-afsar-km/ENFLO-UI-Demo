import React from 'react';
import { mockData } from '@/data/mock';
import Image from 'next/image';
import { Zap, Factory, Battery, PlugZap, HelpCircle } from 'lucide-react';

export function CurrentPowerCard() {
  const { solarGenerationMw, factoryLoadMw, gridImportMw } = mockData.currentPower;
  const { soc: batterySoc } = mockData.battery;
  
  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Power Overview</h2>
          <div className="tooltip-trigger">
            <HelpCircle size={18} />
            <div className="tooltip-content">
              <strong>Answers:</strong> How much solar is being generated and where is it going?
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="mb-8 mt-2">
            <div className="text-7xl font-bold text-primary-text mb-2 tracking-tight flex items-baseline gap-3">
              {solarGenerationMw} <span className="text-3xl text-accent-dark font-medium">MW</span>
            </div>
            <div className="text-lg text-secondary-text font-medium flex items-center gap-2">
              <Zap size={20} className="text-accent-dark" />
              Solar generation
            </div>
          </div>
          
          <div className="w-64 h-40 md:w-80 md:h-48 relative hidden sm:block -mr-4 -mt-4">
            <Image 
              src="/solar-panel.png" 
              alt="Solar Panel" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-auto">
          <div className="bg-surface/60 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <div className="text-secondary-text text-sm font-semibold mb-2 flex items-center gap-1.5"><Factory size={16}/> Factory</div>
            <div className="text-3xl font-bold text-primary-text">{factoryLoadMw} <span className="text-sm font-medium text-secondary-text">MW</span></div>
            <div className="text-sm text-secondary-text mt-1">Current load</div>
          </div>
          
          <div className="bg-surface/60 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <div className="text-secondary-text text-sm font-semibold mb-2 flex items-center gap-1.5"><PlugZap size={16}/> Grid</div>
            <div className="text-3xl font-bold text-primary-text">{gridImportMw} <span className="text-sm font-medium text-secondary-text">MW</span></div>
            <div className="text-sm text-secondary-text mt-1">Import</div>
          </div>
          
          <div className="bg-surface/60 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <div className="text-secondary-text text-sm font-semibold mb-2 flex items-center gap-1.5"><Battery size={16}/> Battery</div>
            <div className="text-3xl font-bold text-primary-text">{batterySoc} <span className="text-sm font-medium text-secondary-text">%</span></div>
            <div className="text-sm text-secondary-text mt-1">SOC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
