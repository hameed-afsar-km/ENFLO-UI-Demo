"use client";

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { Sun, Factory, BatteryMedium, Zap, HelpCircle, ArrowRight, ArrowDown } from 'lucide-react';

export function EnergyFlowCard() {
  const { emsState } = useSimulation();
  const { 
    solarGenerationMw, 
    factoryLoadMw,
    directToFactoryMw, 
    toBatteryMw, 
    toGridMw,
    batteryChargeMw,
    batteryDischargeMw,
    gridImportMw,
    gridExportMw,
    surplusMw
  } = emsState.currentPower;

  return (
    <div className="solid-card p-5 h-full flex flex-col group">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Energy Flow</h2>
        {surplusMw > 0 && (
          <div className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-200">
            {surplusMw.toFixed(2)} MW SURPLUS
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-between py-4 relative">
        
        {/* Top: Solar */}
        <div className="flex flex-col items-center w-full relative z-10">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-1 shadow-md border-2 border-orange-300">
            <Sun size={28} className="text-orange-500" />
          </div>
          <div className="text-center bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
            <div className="font-black text-gray-900 text-sm">SOLAR</div>
            <div className="text-xs text-orange-600 font-bold">{solarGenerationMw.toFixed(2)} MW</div>
          </div>
        </div>
        
         {/* Middle Flow Area */}
         <div className="w-full flex-1 min-h-[100px] relative my-2">
            {/* Solar to Factory (Center) */}
            {directToFactoryMw > 0 && (
              <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-orange-400 -translate-x-1/2 z-10">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-orange-400 rounded-full flex items-center justify-center">
                   <ArrowDown size={8} className="text-orange-400"/>
                 </div>
              </div>
            )}

            {/* Solar to Grid (Export) */}
            {gridExportMw > 0 && (
              <>
                <div className="absolute top-[20%] right-1/2 left-[56px] h-[30%] border-t-2 border-l-2 border-orange-400 rounded-tl-xl z-0" />
                <div className="absolute top-[50%] left-[56px] w-[2px] h-[50%] bg-orange-400 z-0" />
                <div className="absolute top-[50%] left-[56px] -translate-x-[3px] -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping z-10" />
              </>
            )}

            {/* Solar to Battery */}
            {toBatteryMw > 0 && (
              <>
                <div className="absolute top-[20%] left-1/2 right-[56px] h-[30%] border-t-2 border-r-2 border-orange-400 rounded-tr-xl z-0" />
                <div className="absolute top-[50%] right-[56px] w-[2px] h-[50%] bg-orange-400 z-0" />
                <div className="absolute top-[50%] right-[56px] translate-x-[3px] -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping z-10" />
              </>
            )}

            {/* Grid to Factory (Import) */}
            {gridImportMw > 0 && (
              <>
                <div className="absolute top-[70%] left-[56px] w-[2px] h-[30%] border-l-2 border-purple-400 border-dashed z-20" />
                <div className="absolute top-[70%] left-[56px] right-[calc(50%+8px)] h-[30%] border-t-2 border-r-2 border-purple-400 border-dashed rounded-tr-xl z-20" />
              </>
            )}

            {/* Battery to Factory */}
            {batteryDischargeMw > 0 && (
              <>
                <div className="absolute top-[70%] right-[56px] w-[2px] h-[30%] border-r-2 border-green-500 border-dashed z-20" />
                <div className="absolute top-[70%] right-[56px] left-[calc(50%+8px)] h-[30%] border-t-2 border-l-2 border-green-500 border-dashed rounded-tl-xl z-20" />
              </>
            )}
         </div>
        
        {/* Bottom Destinations */}
        <div className="w-full flex justify-between px-4 relative z-10">
          {/* GRID */}
          <div className="flex flex-col items-center text-center w-20">
             <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-1 border-2 border-purple-200 shadow-sm relative">
               <Zap size={22} className="text-purple-600" />
               {gridImportMw > 0 && <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">IN</span>}
               {gridExportMw > 0 && <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">OUT</span>}
             </div>
             <div className="font-bold text-gray-900 text-xs">GRID</div>
             <div className="text-[10px] text-gray-600 font-bold">
                {gridImportMw > 0 ? `${gridImportMw.toFixed(2)} MW Import` : gridExportMw > 0 ? `${gridExportMw.toFixed(2)} MW Export` : '0.00 MW'}
             </div>
          </div>

          {/* FACTORY (LOAD) */}
          <div className="flex flex-col items-center text-center w-20">
             <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-1 border-2 border-gray-300 shadow-md">
               <Factory size={24} className="text-gray-700" />
             </div>
             <div className="font-black text-gray-900 text-xs">LOAD</div>
             <div className="text-xs text-gray-800 font-bold">{factoryLoadMw.toFixed(2)} MW</div>
          </div>
          
          {/* BATTERY */}
          <div className="flex flex-col items-center text-center w-20">
             <div className={`w-12 h-12 rounded-xl ${batteryChargeMw > 0 ? 'bg-green-50 border-green-300' : batteryDischargeMw > 0 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'} flex items-center justify-center mb-1 border-2 shadow-sm relative`}>
               <BatteryMedium size={22} className={batteryChargeMw > 0 ? 'text-green-600' : batteryDischargeMw > 0 ? 'text-blue-600' : 'text-gray-400'} />
               {batteryChargeMw > 0 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">IN</span>}
               {batteryDischargeMw > 0 && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">OUT</span>}
             </div>
             <div className="font-bold text-gray-900 text-xs">BATTERY</div>
             <div className="text-[10px] text-gray-600 font-bold">
               {batteryChargeMw > 0 ? `${batteryChargeMw.toFixed(2)} MW In` : batteryDischargeMw > 0 ? `${batteryDischargeMw.toFixed(2)} MW Out` : 'Idle'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
