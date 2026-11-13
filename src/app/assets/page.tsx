"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { MapPin, ChevronDown, Search, Activity, X } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

type HealthPoint = { day: string; health: number };

type HealthHistory = {
  series: HealthPoint[];
  totalErrors: number;
  lowProduction: number;
  maintenance: number;
  uptime: string;
};

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic per-asset history: same panel always plots the same curve. */
function buildHealthHistory(
  panelId: string,
  panel?: { pr: number; eff: number; temp: number },
): HealthHistory {
  const seed = hashString(panelId);
  const rand = seededRandom(seed);
  const pr = panel?.pr ?? 82;
  const eff = panel?.eff ?? 95;
  const temp = panel?.temp ?? 42;

  const base = Math.max(78, Math.min(97, pr + (eff - 95) * 1.2 - Math.max(0, temp - 42) * 0.35));
  const drift = (rand() - 0.5) * 2.5;
  const phase = (seed % 628) / 100;
  const dipDay = 7 + (seed % 15);
  const dipDepth = 12 + (seed % 14);

  const series: HealthPoint[] = Array.from({ length: 30 }, (_, index) => {
    const seasonal = Math.sin(index / 4.5 + phase) * 1.6;
    const noise = (rand() - 0.5) * 1.4;
    const dip = index === dipDay ? dipDepth : index === dipDay + 1 ? dipDepth * 0.5 : 0;
    const health = base + drift + seasonal + noise - dip;
    return { day: `Day ${index + 1}`, health: Number(Math.min(99.5, Math.max(58, health)).toFixed(1)) };
  });

  const totalErrors =
    series.filter((point, index) => index > 0 && series[index - 1].health - point.health > 3).length +
    (seed % 3);
  const lowProduction = series.filter((point) => point.health < 80).length;
  const maintenance = 1 + (seed % 4);
  const uptime = Math.max(97.5, 100 - totalErrors * 0.08 - lowProduction * 0.04).toFixed(2);

  return { series, totalErrors, lowProduction, maintenance, uptime };
}

// Mocking Plants
const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENERCO Chennai',
    panels: ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04'].map((id, i) => ({ ...mockData.panels[i], id })),
  },
  {
    id: 'PL-02',
    name: 'ENERCO Coimbatore',
    panels: ['PNL-05', 'PNL-06', 'PNL-07'].map((id, i) => ({ ...mockData.panels[i + 4], id })),
  },
  {
    id: 'PL-03',
    name: 'ENERCO Madurai',
    panels: ['PNL-08', 'PNL-09'].map((id, i) => ({ ...mockData.panels[i % mockData.panels.length], id })),
  }
];

function AssetsPageContent() {
  const searchParams = useSearchParams();
  const queryPlantName = searchParams?.get('plantName');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>('PL-01');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [healthModalAsset, setHealthModalAsset] = useState<string | null>(null);

  const { activeSimulations } = useSimulation();

  useEffect(() => {
    if (queryPlantName) {
      const plant = PLANTS.find(p => p.name === queryPlantName);
      if (plant) setSelectedPlantId(plant.id);
    }
  }, [queryPlantName]);

  const selectedPlant = PLANTS.find(p => p.id === selectedPlantId) || PLANTS[0];

  const displayPanels = selectedPlant.panels.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(p => {
    const isError = activeSimulations.some(sim => sim.plantName === selectedPlant.name && sim.panelId === p.id);
    return isError ? { ...p, status: 'Critical', acKw: 0, dcKw: 0, eff: 0 } : p;
  });

  const healthHistory = useMemo(() => {
    if (!healthModalAsset) return null;
    const panel = selectedPlant.panels.find((item) => item.id === healthModalAsset);
    return buildHealthHistory(healthModalAsset, panel);
  }, [healthModalAsset, selectedPlant]);

  return (
    <div className="flex flex-col gap-6 w-full pb-20 relative">
      <PlantStatusHeader />
      
      <div className="solid-card p-0 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-primary-text">Asset Management</h2>
            <p className="text-sm text-secondary-text mt-1">Manage and monitor all plant hardware assets.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text group-focus-within:text-accent-dark transition-colors" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all placeholder-secondary-text/70"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-primary-text hover:border-accent transition-colors shadow-sm group"
              >
                <MapPin size={16} className="text-secondary-text group-hover:text-accent-dark" />
                <span className="hidden sm:inline">Select Plant: </span>
                <span className="font-bold">{selectedPlant.name}</span>
                <ChevronDown size={16} className={`text-secondary-text ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {PLANTS.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => {
                        setSelectedPlantId(plant.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${
                        selectedPlantId === plant.id ? 'bg-accent/5 text-accent-dark font-bold' : 'text-primary-text'
                      }`}
                    >
                      {plant.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface text-xs uppercase tracking-wider text-secondary-text font-bold border-b border-border">
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">AC Power</th>
                <th className="px-6 py-4">DC Power</th>
                <th className="px-6 py-4">Efficiency</th>
                <th className="px-6 py-4">Temp</th>
                <th className="px-6 py-4">Health History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm bg-white">
              {displayPanels.map((panel) => (
                <tr key={panel.id} className={`transition-colors ${panel.status === 'Critical' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 font-bold text-primary-text flex items-center gap-2">
                    {panel.id}
                    {panel.status === 'Critical' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span></span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      panel.status === 'Normal' ? 'bg-success/10 text-success' : 
                      panel.status === 'Warning' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger border border-danger/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        panel.status === 'Normal' ? 'bg-success' : 
                        panel.status === 'Warning' ? 'bg-warning' : 'bg-danger animate-pulse'
                      }`}></span>
                      {panel.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${panel.status === 'Critical' ? 'text-red-500 font-bold' : 'text-primary-text'}`}>{panel.acKw} kW</td>
                  <td className={`px-6 py-4 ${panel.status === 'Critical' ? 'text-red-500 font-bold' : 'text-secondary-text'}`}>{panel.dcKw} kW</td>
                  <td className={`px-6 py-4 ${panel.status === 'Critical' ? 'text-red-500 font-bold' : 'text-primary-text'}`}>{panel.eff}%</td>
                  <td className="px-6 py-4 text-secondary-text">{panel.temp}°C</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setHealthModalAsset(panel.id)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors tooltip-trigger"
                    >
                      <Activity size={16} />
                      <div className="tooltip-content !-translate-x-1/2 !left-1/2 !right-auto">View Health</div>
                    </button>
                  </td>
                </tr>
              ))}
              {displayPanels.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-secondary-text font-medium bg-gray-50">
                    No assets found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health History Modal */}
      {healthModalAsset && healthHistory && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[700px] max-w-[95vw] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Health History: {healthModalAsset}</h2>
                  <p className="text-sm text-gray-500">30-day performance and health index</p>
                </div>
              </div>
              <button 
                onClick={() => setHealthModalAsset(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50/50">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-gray-900">{healthHistory.totalErrors}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Total Errors</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-orange-500">{healthHistory.lowProduction}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Low Production</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-emerald-500">{healthHistory.maintenance}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Maintenance</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-green-500">{healthHistory.uptime}%</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Uptime</div>
              </div>
            </div>
            
            <div className="p-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory.series}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading assets...</div>}>
      <AssetsPageContent />
    </Suspense>
  );
}
