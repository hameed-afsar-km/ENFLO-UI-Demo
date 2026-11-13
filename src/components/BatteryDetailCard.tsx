"use client";

import React from 'react';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  ShieldAlert, 
  RefreshCcw, 
  Battery, 
  HelpCircle,
  Clock,
  Gauge,
  Cpu,
  TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

export function BatteryDetailCard() {
  const { emsState } = useSimulation();
  const { battery } = emsState;

  const getStatusColor = () => {
    switch (battery.state) {
      case 'Charging': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Discharging': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Full': return 'bg-green-50 text-green-700 border-green-200';
      case 'Reserve': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const powerMw = battery.state === 'Charging' 
    ? (battery.chargePowerMw || 0.42) 
    : (battery.dischargePowerMw || 0);

  const usableMwh = battery.usableEnergyMwh ?? (battery.ratedCapacityMwh * (battery.soc / 100));
  const maxTargetMwh = battery.ratedCapacityMwh * (battery.maxReserve / 100);
  const minTargetMwh = battery.ratedCapacityMwh * (battery.minReserve / 100);

  // Time to full/empty
  let timeEstimateStr = "";
  if (battery.state === 'Charging' && powerMw > 0) {
    const mwhNeeded = Math.max(0, maxTargetMwh - usableMwh);
    const mins = Math.round((mwhNeeded / powerMw) * 60);
    timeEstimateStr = mins > 0 ? `~${Math.floor(mins / 60)}h ${mins % 60}m to 90%` : 'Target float reached';
  } else if (battery.state === 'Discharging' && powerMw > 0) {
    const mwhAvailable = Math.max(0, usableMwh - minTargetMwh);
    const mins = Math.round((mwhAvailable / powerMw) * 60);
    timeEstimateStr = mins > 0 ? `~${Math.floor(mins / 60)}h ${mins % 60}m to reserve` : 'Reserve limit reached';
  } else {
    timeEstimateStr = `Standby backup: ~${((usableMwh / 1.0) || 2.4).toFixed(1)}h`;
  }

  // 12-hour charge & discharge trend curve for BESS
  const socTrendData = [
    { time: '06:00', soc: 26, power: 0.00 },
    { time: '08:00', soc: 34, power: 0.15 },
    { time: '10:00', soc: 48, power: 0.38 },
    { time: '12:00', soc: 62, power: 0.42 },
    { time: '14:30', soc: Math.round(battery.soc), power: battery.state === 'Charging' ? powerMw : -powerMw },
    { time: '17:00', soc: Math.min(90, Math.round(battery.soc + 18)), power: 0.25 },
    { time: '19:00', soc: 68, power: -0.65 },
    { time: '21:00', soc: 38, power: -0.50 },
  ];

  // SVG Circular Gauge calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (battery.soc / 100) * circumference;

  return (
    <div className="solid-card p-6 flex flex-col h-full group bg-white justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Battery size={16} className="text-emerald-500"/> BESS Diagnostics
            </h2>
            <div className="tooltip-trigger">
              <HelpCircle size={15} />
              <div className="tooltip-content w-64">
                <strong className="block mb-1 text-white font-bold">Battery Energy Storage System:</strong>
                Monitors Li-ion BESS telemetry: State of Charge (SoC), active charge/discharge throughput, evening peak reserves, and long-term cell health.
              </div>
            </div>
          </div>
          
          <div className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${getStatusColor()}`}>
            {battery.state === 'Charging' && <Zap size={12} className="animate-pulse" />}
            {battery.state === 'Reserve' && <ShieldAlert size={12} />}
            <span>{battery.state}</span>
            <span className="font-mono text-[11px] font-extrabold ml-0.5">
              {battery.state === 'Charging' ? `+${powerMw.toFixed(2)} MW` : 
               battery.state === 'Discharging' ? `-${powerMw.toFixed(2)} MW` : '0.00 MW'}
            </span>
          </div>
        </div>

        {/* Top Section: Dual Gauge & Electrical Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
          
          {/* Left: Circular SoC Gauge Dial (5 cols) */}
          <div className="sm:col-span-5 bg-gray-50/80 border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-gray-200"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className={battery.soc <= battery.minReserve ? "stroke-rose-500" : "stroke-emerald-500"}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              
              {/* Center SoC Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  {battery.soc}%
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">SoC</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-xs font-black text-gray-900">{usableMwh.toFixed(2)} MWh</div>
              <div className="text-[10px] text-gray-400 font-semibold mb-1.5">of {battery.ratedCapacityMwh.toFixed(1)} MWh Cap</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                <span>Reserve: {battery.recommendedReserveForEvening || 42}% Ready</span>
              </div>
            </div>
          </div>

          {/* Right: Live BESS Electrical Parameters (7 cols) */}
          <div className="sm:col-span-7 grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Zap size={11} className="text-amber-500" /> DC Voltage
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">742 V <span className="text-[10px] text-gray-400 font-semibold">DC</span></div>
              <div className="text-[9px] text-emerald-600 font-bold">Nominal ±1.2%</div>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu size={11} className="text-blue-500" /> Inverter Current
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">566 A</div>
              <div className="text-[9px] text-blue-600 font-bold">0.21 C Rate</div>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer size={11} className="text-rose-500" /> BMS Temp
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">28.4°C</div>
              <div className="text-[9px] text-emerald-600 font-bold">Racks A &amp; B Cool</div>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={11} className="text-indigo-500" /> Target Duration
              </div>
              <div className="text-xs font-black text-gray-900 mt-0.5 truncate">{timeEstimateStr}</div>
              <div className="text-[9px] text-indigo-600 font-bold">Min {battery.minReserve}% · Max {battery.maxReserve}%</div>
            </div>
          </div>
        </div>

        {/* Middle Section: Mini 12-Hour Charge & Discharge Trend Area Chart */}
        <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-3 mb-3">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" /> 12-Hour BESS Dispatch &amp; SoC Profile
            </span>
            <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded border border-emerald-100">
              Solar Charging Window
            </span>
          </div>

          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={socTrendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="bessSocGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fill: '#9ca3af' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', padding: '4px 8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}% SoC`, 'Battery Level']}
                />
                <Area 
                  type="monotone" 
                  dataKey="soc" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fill="url(#bessSocGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer: 4 Core Engineering Health Metrics */}
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