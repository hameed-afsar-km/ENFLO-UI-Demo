"use client";

import React from 'react';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  ShieldAlert, 
  RefreshCcw, 
  Battery as BatteryIcon, 
  HelpCircle,
  Clock,
  Gauge,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';

export function BatteryDetailCard() {
  const { emsState, selectedPlant, plantPanelCount } = useSimulation();
  const { battery } = emsState;

  const isCharging = battery.state === 'Charging';
  const isDischarging = battery.state === 'Discharging';

  const getStatusColor = () => {
    switch (battery.state) {
      case 'Charging': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Discharging': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Full': return 'bg-green-50 text-green-700 border-green-200';
      case 'Reserve': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const powerMw = isCharging 
    ? (battery.chargePowerMw || 0.42) 
    : (battery.dischargePowerMw || 0);

  const usableMwh = battery.usableEnergyMwh ?? (battery.ratedCapacityMwh * (battery.soc / 100));
  const maxTargetMwh = battery.ratedCapacityMwh * (battery.maxReserve / 100);
  const minTargetMwh = battery.ratedCapacityMwh * (battery.minReserve / 100);

  // Time estimate
  let timeEstimateStr = "";
  if (isCharging && powerMw > 0) {
    const mwhNeeded = Math.max(0, maxTargetMwh - usableMwh);
    const mins = Math.round((mwhNeeded / powerMw) * 60);
    timeEstimateStr = mins > 0 ? `~${Math.floor(mins / 60)}h ${mins % 60}m to 90%` : 'Float target reached';
  } else if (isDischarging && powerMw > 0) {
    const mwhAvailable = Math.max(0, usableMwh - minTargetMwh);
    const mins = Math.round((mwhAvailable / powerMw) * 60);
    timeEstimateStr = mins > 0 ? `~${Math.floor(mins / 60)}h ${mins % 60}m to reserve` : 'Reserve limit reached';
  } else {
    timeEstimateStr = `Standby backup: ~${((usableMwh / 1.0) || 2.4).toFixed(1)}h`;
  }

  // 10-segment modular lithium rack representation
  const totalSegments = 10;
  const filledSegments = Math.round((battery.soc / 100) * totalSegments);

  return (
    <div className="solid-card p-6 flex flex-col h-full group bg-white justify-between">
      {/* 1. Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <BatteryIcon size={16} className="text-emerald-500"/> Plant BESS Storage · {selectedPlant}
              </h2>
              <div className="tooltip-trigger">
                <HelpCircle size={15} />
                <div className="tooltip-content w-72">
                  <strong className="block mb-1 text-white font-bold">Centralized Plant Battery (BESS):</strong>
                  1 central 2.0 MWh BESS serves the entire {selectedPlant} facility, buffering aggregated output across all {plantPanelCount} individual panels. There is 1 central battery per plant, not per panel.
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              1 Central Battery buffers entire plant · Buffers all {plantPanelCount} individual panels
            </p>
          </div>
          
          <div className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${getStatusColor()}`}>
            {isCharging && <Zap size={12} className="animate-pulse" />}
            {battery.state === 'Reserve' && <ShieldAlert size={12} />}
            <span>{battery.state}</span>
            <span className="font-mono text-[11px] font-extrabold ml-0.5">
              {isCharging ? `+${powerMw.toFixed(2)} MW` : 
               isDischarging ? `-${powerMw.toFixed(2)} MW` : '0.00 MW'}
            </span>
          </div>
        </div>

        {/* 2. PROMINENT PHYSICAL BATTERY CAPSULE ENCLOSURE */}
        <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl border border-gray-200 p-4 mb-4 shadow-inner relative">
          
          {/* Subline above battery */}
          <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 uppercase text-[10px] tracking-wider">Storage Capacity:</span>
              <span className="text-gray-900 font-extrabold">{usableMwh.toFixed(2)} MWh</span>
              <span className="text-gray-400 font-normal">/ {battery.ratedCapacityMwh.toFixed(1)} MWh</span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
              <Clock size={12} className="text-gray-400" />
              <span>{timeEstimateStr}</span>
            </div>
          </div>

          {/* Real Industrial Battery Enclosure Shape */}
          <div className="relative w-full pr-5">
            <div className="relative w-full h-24 sm:h-28 border-[3px] border-gray-400/90 rounded-2xl p-2 bg-gray-900/90 shadow-lg flex items-center justify-between overflow-hidden">
              
              {/* Terminal Nipple (Positive Cathode) on the right */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-3.5 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-r-md border-r-2 border-y-2 border-gray-500 shadow-sm z-30"></div>

              {/* Min Reserve Marker (25%) */}
              <div 
                className="absolute top-0 bottom-0 border-r-2 border-dashed border-orange-400/80 z-20 pointer-events-none" 
                style={{ left: `${battery.minReserve}%` }}
              >
                <div className="absolute top-1 -translate-x-1/2 text-[8px] font-bold text-orange-300 bg-gray-900/90 px-1 py-0.2 rounded border border-orange-500/50">
                  Min {battery.minReserve}%
                </div>
              </div>

              {/* Max Float Marker (90%) */}
              <div 
                className="absolute top-0 bottom-0 border-r-2 border-dashed border-blue-400/80 z-20 pointer-events-none" 
                style={{ left: `${battery.maxReserve}%` }}
              >
                <div className="absolute top-1 -translate-x-1/2 text-[8px] font-bold text-blue-300 bg-gray-900/90 px-1 py-0.2 rounded border border-blue-500/50">
                  Max {battery.maxReserve}%
                </div>
              </div>

              {/* 10 Modular Lithium Cell Racks (Inside the battery) */}
              <div className="grid grid-cols-10 gap-1.5 w-full h-full relative z-10">
                {Array.from({ length: totalSegments }).map((_, idx) => {
                  const isFilled = idx < filledSegments;
                  const isCurrent = idx === filledSegments - 1;
                  return (
                    <div 
                      key={idx}
                      className={`h-full rounded-lg transition-all duration-500 relative overflow-hidden flex flex-col justify-between p-1 ${
                        isFilled 
                          ? battery.soc <= battery.minReserve 
                            ? 'bg-gradient-to-t from-orange-600 via-rose-500 to-amber-400 border border-orange-400/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                            : 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 border border-emerald-300/60 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                          : 'bg-gray-800/60 border border-gray-700/50'
                      }`}
                    >
                      {/* Cell Module Lines */}
                      <div className="w-full h-0.5 bg-white/20 rounded"></div>
                      {isFilled && (
                        <div className={`w-full h-1/2 bg-white/15 rounded ${isCurrent && isCharging ? 'animate-pulse' : ''}`}></div>
                      )}
                      <div className="w-full h-0.5 bg-black/20 rounded"></div>
                    </div>
                  );
                })}
              </div>

              {/* Large Centered Hero SoC Badge right on the battery glass */}
              <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                <div className="bg-gray-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center shadow-2xl flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {battery.soc}%
                  </div>
                  <div className="text-left border-l border-white/20 pl-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      {isCharging ? <Zap size={10} className="animate-pulse" /> : <BatteryIcon size={10} />}
                      {isCharging ? 'Charging' : isDischarging ? 'Discharging' : 'Nominal SoC'}
                    </div>
                    <div className="text-xs font-bold text-gray-200">
                      {usableMwh.toFixed(2)} MWh Available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy tags right below battery */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mt-3 px-1">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Peak Arbitrage Reserve: {battery.recommendedReserveForEvening || 42}% Ready
            </span>
            <span className="text-gray-600 font-medium">
              1 Central Battery · 10 Modular LFP Racks · Buffers {plantPanelCount} Panels
            </span>
          </div>
        </div>

        {/* 3. BESS Operating Status Matrix (Fills the center seamlessly) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Zap size={11} className="text-amber-500" /> DC Voltage
            </div>
            <div className="text-sm font-black text-gray-900 mt-0.5">742 V <span className="text-[10px] text-gray-400 font-semibold">DC</span></div>
            <div className="text-[9px] text-emerald-600 font-bold">Nominal ±1.2%</div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Cpu size={11} className="text-blue-500" /> Inverter Current
            </div>
            <div className="text-sm font-black text-gray-900 mt-0.5">566 A</div>
            <div className="text-[9px] text-blue-600 font-bold">0.21 C Rate</div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Thermometer size={11} className="text-rose-500" /> BMS Temp
            </div>
            <div className="text-sm font-black text-gray-900 mt-0.5">28.4°C</div>
            <div className="text-[9px] text-emerald-600 font-bold">Racks A &amp; B Cool</div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" /> Protection
            </div>
            <div className="text-sm font-black text-gray-900 mt-0.5">Active</div>
            <div className="text-[9px] text-emerald-600 font-bold">0 Alarms Active</div>
          </div>
        </div>
      </div>
      
      {/* 4. Bottom Engineering Diagnostic Footer */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100 text-center">
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">
            <Activity size={10} className="text-blue-500" /> SOH
          </div>
          <div className="text-sm font-black text-gray-900 mt-0.5">{battery.soh}%</div>
          <div className="text-[8px] text-gray-400 font-semibold">State of Health</div>
        </div>

        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">
            <RefreshCcw size={10} className="text-purple-500" /> Cycles
          </div>
          <div className="text-sm font-black text-gray-900 mt-0.5">{battery.cycleCount}</div>
          <div className="text-[8px] text-gray-400 font-semibold">Of 6,000 Rated</div>
        </div>

        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">
            <Gauge size={10} className="text-amber-500" /> RTE
          </div>
          <div className="text-sm font-black text-gray-900 mt-0.5">{battery.rte}%</div>
          <div className="text-[8px] text-gray-400 font-semibold">Round-Trip Eff</div>
        </div>

        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">
            <Thermometer size={10} className="text-rose-500" /> Degradation
          </div>
          <div className="text-sm font-black text-gray-900 mt-0.5">{battery.degradationRate}%</div>
          <div className="text-[8px] text-gray-400 font-semibold">Annual Rate</div>
        </div>
      </div>
    </div>
  );
}