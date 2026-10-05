"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { MapPin, ChevronDown, Search, Activity, X } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mocking Plants
const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENECO Chennai',
    panels: ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04'].map((id, i) => ({ ...mockData.panels[i], id })),
  },
  {
    id: 'PL-02',
    name: 'ENECO Coimbatore',
    panels: ['PNL-05', 'PNL-06', 'PNL-07'].map((id, i) => ({ ...mockData.panels[i + 4], id })),
  },
  {
    id: 'PL-03',
    name: 'ENECO Madurai',
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

  // Mock health data
  const healthData = Array.from({ length: 30 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    health: 80 + Math.random() * 20 - (Math.random() > 0.9 ? 30 : 0) // Occasional drops
  }));

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
      {healthModalAsset && (
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
                <div className="text-xl font-black text-gray-900">12</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Total Errors</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-orange-500">4</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Low Production</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-emerald-500">2</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Maintenance</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xl font-black text-green-500">99.8%</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Uptime</div>
              </div>
            </div>
            
            <div className="p-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
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
