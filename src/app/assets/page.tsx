"use client";

import { useState } from "react";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { MapPin, ChevronDown, Search } from "lucide-react";

// Mocking Plants
const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENFLO MAIN',
    panels: mockData.inverters.slice(0, 4),
  },
  {
    id: 'PL-02',
    name: 'XYZ',
    panels: mockData.inverters.slice(4, 8),
  }
];

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>('PL-01');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedPlant = PLANTS.find(p => p.id === selectedPlantId) || PLANTS[0];

  const displayPanels = selectedPlant.panels.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-xs uppercase tracking-wider text-secondary-text font-bold border-b border-border">
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">AC Power</th>
                <th className="px-6 py-4">DC Power</th>
                <th className="px-6 py-4">Efficiency</th>
                <th className="px-6 py-4">Temp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm bg-white">
              {displayPanels.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary-text">{inv.id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'Normal' ? 'bg-success/10 text-success' : 
                      inv.status === 'Warning' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        inv.status === 'Normal' ? 'bg-success' : 
                        inv.status === 'Warning' ? 'bg-warning' : 'bg-danger'
                      }`}></span>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-primary-text">{inv.acKw} kW</td>
                  <td className="px-6 py-4 text-secondary-text">{inv.dcKw} kW</td>
                  <td className="px-6 py-4 text-primary-text">{inv.eff}%</td>
                  <td className="px-6 py-4 text-secondary-text">{inv.temp}°C</td>
                </tr>
              ))}
              {displayPanels.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-secondary-text font-medium bg-gray-50">
                    No assets found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
