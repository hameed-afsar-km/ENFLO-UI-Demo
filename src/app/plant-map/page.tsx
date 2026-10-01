"use client";

import { useState } from "react";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { Search, ChevronLeft, MapPin } from "lucide-react";

// Mocking Plants containing Panels (using inverters as panels)
const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENFLO Chennai',
    location: 'Chennai, TN',
    status: 'Normal',
    panels: mockData.inverters.slice(0, 4),
    x: '78%', y: '15%'
  },
  {
    id: 'PL-02',
    name: 'ENFLO Coimbatore',
    location: 'Coimbatore, TN',
    status: 'Warning',
    panels: mockData.inverters.slice(4, 7),
    x: '25%', y: '50%'
  },
  {
    id: 'PL-03',
    name: 'ENFLO Madurai',
    location: 'Madurai, TN',
    status: 'Normal',
    panels: mockData.inverters.slice(7, 8),
    x: '40%', y: '75%'
  }
];

export default function PlantMapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const selectedPlant = PLANTS.find(p => p.id === selectedPlantId);

  // Filter Plants if no plant is selected, otherwise filter panels within the selected plant
  const displayPlants = PLANTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayPanels = selectedPlant?.panels.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-6 min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {selectedPlant && (
              <button 
                onClick={() => setSelectedPlantId(null)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-secondary-text transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-primary-text">
              {selectedPlant ? `Plant Details: ${selectedPlant.name}` : "Interactive Plant Map - Tamil Nadu"}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input 
                type="text" 
                placeholder={selectedPlant ? "Search panels..." : "Search plants or location..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-surface/80 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent w-64 transition-all placeholder-secondary-text/70"
              />
            </div>
            
            <div className="flex gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success"></span> Normal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning"></span> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger"></span> Fault</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-50 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center p-8">
          
          {!selectedPlant ? (
            // Show Map View
            <div className="relative w-full max-w-4xl h-[500px] bg-[#eef2f6] rounded-2xl border-4 border-white shadow-inner overflow-hidden">
              {/* Abstract Map Graphic (Placeholder for Tamil Nadu Map) */}
              <svg className="absolute inset-0 w-full h-full text-white drop-shadow-md" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
                <path d="M 280 50 C 300 80 320 120 310 160 C 300 200 290 230 260 260 C 230 290 200 320 180 360 C 160 400 170 430 150 460 C 130 490 100 480 80 460 C 60 440 50 400 60 360 C 70 320 90 280 120 250 C 150 220 170 180 190 140 C 210 100 240 60 280 50 Z" fill="#cbe3ee" stroke="#94a3b8" strokeWidth="2" />
              </svg>

              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0D9488 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              
              {/* Plant Markers */}
              {displayPlants.map((plant) => (
                <div 
                  key={plant.id}
                  onClick={() => {
                    setSelectedPlantId(plant.id);
                    setSearchQuery("");
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: plant.x, top: plant.y }}
                >
                  {/* Pulse Effect */}
                  <div className={`absolute -inset-2 rounded-full animate-ping opacity-20 ${
                    plant.status === 'Normal' ? 'bg-success' : 
                    plant.status === 'Warning' ? 'bg-warning' : 'bg-danger'
                  }`}></div>
                  
                  {/* Pin */}
                  <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-lg z-10 ${
                    plant.status === 'Normal' ? 'bg-success' : 
                    plant.status === 'Warning' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                  
                  {/* Tooltip Card */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-border p-3 w-48 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-20 pointer-events-none">
                    <h3 className="font-bold text-primary-text text-sm">{plant.name}</h3>
                    <p className="text-xs text-secondary-text mb-2">{plant.location}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-xs font-bold">{plant.panels.length} Panels</span>
                      <span className="text-[10px] font-bold text-accent-dark">View →</span>
                    </div>
                  </div>
                </div>
              ))}

              {displayPlants.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-secondary-text font-bold bg-white/50 backdrop-blur-sm z-30">
                  No plants match your search.
                </div>
              )}
            </div>
          ) : (
            // Show Panels for selected plant
            <div className="w-full max-w-5xl relative z-10 flex flex-col h-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                {displayPanels.map((panel) => (
                  <div 
                    key={panel.id}
                    className="bg-white border-2 border-border shadow-sm p-4 rounded-xl flex flex-col items-center hover:border-accent hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded-full mb-3 shadow-sm ${
                      panel.status === 'Normal' ? 'bg-success' : 
                      panel.status === 'Warning' ? 'bg-warning' : 'bg-danger'
                    }`}></div>
                    <div className="font-bold text-primary-text">{panel.id}</div>
                    <div className="text-xs font-medium text-secondary-text mt-1">{panel.acKw} kW AC</div>
                    <div className="text-xs font-medium text-secondary-text">{panel.eff}% Eff</div>
                  </div>
                ))}
                {displayPanels.length === 0 && (
                  <div className="col-span-full text-center py-10 text-secondary-text font-medium">No panels match your search.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
