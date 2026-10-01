import React from 'react';
import { mockData } from '@/data/mock';
import { Sun, ArrowDown, ArrowRight, Factory, BatteryMedium, Zap, HelpCircle } from 'lucide-react';

export function EnergyFlowCard() {
  const { 
    solarGenerationMw, 
    directToFactoryMw, 
    toBatteryMw, 
    toGridMw 
  } = mockData.currentPower;

  return (
    <div className="solid-card p-5 h-full flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Energy Flow</h2>
        <div className="tooltip-trigger">
          <HelpCircle size={18} />
          <div className="tooltip-content">
            <strong>Answers:</strong> Where is the generated solar energy going?
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        {/* Source */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-1 shadow-sm border border-orange-200">
            <Sun size={24} className="text-orange-500" />
          </div>
          <div className="text-center">
            <div className="font-bold text-primary-text text-sm">SOLAR</div>
            <div className="text-xs text-secondary-text font-medium">{solarGenerationMw} MW</div>
          </div>
        </div>
        
        {/* Flow Lines */}
        <div className="w-full h-8 flex flex-col items-center justify-center relative mt-1 mb-2">
           <div className="w-0.5 h-full bg-accent relative z-0"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-4 h-4 bg-white rounded-full border-2 border-accent flex items-center justify-center">
             <ArrowDown size={10} className="text-accent" />
           </div>
           
           <div className="absolute top-full left-[15%] right-[15%] h-0.5 bg-accent"></div>
           <div className="absolute top-full left-[15%] w-0.5 h-4 bg-accent"></div>
           <div className="absolute top-full left-1/2 w-0.5 h-4 bg-accent"></div>
           <div className="absolute top-full right-[15%] w-0.5 h-4 bg-accent"></div>
        </div>
        
        {/* Destinations */}
        <div className="w-full flex justify-between mt-4 px-2">
          <div className="flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-1 border border-blue-100">
               <Factory size={18} className="text-blue-600" />
             </div>
             <div className="font-semibold text-primary-text text-xs">Factory</div>
             <div className="text-[10px] text-secondary-text font-medium">{directToFactoryMw} MW</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-1 border border-green-100">
               <BatteryMedium size={18} className="text-green-600" />
             </div>
             <div className="font-semibold text-primary-text text-xs">Battery</div>
             <div className="text-[10px] text-secondary-text font-medium">{toBatteryMw} MW</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-1 border border-purple-100">
               <Zap size={18} className="text-purple-600" />
             </div>
             <div className="font-semibold text-primary-text text-xs">Grid</div>
             <div className="text-[10px] text-secondary-text font-medium">{toGridMw} MW</div>
          </div>
        </div>
      </div>
    </div>
  );
}
