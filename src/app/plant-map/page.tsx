"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { Search, ChevronLeft, MapPin } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border-4 border-white shadow-inner font-bold text-gray-400">Loading Map...</div>
});

const CHENNAI_PANELS = ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04', 'PNL-10', 'PNL-11', 'PNL-12', 'PNL-13', 'PNL-14', 'PNL-15', 'PNL-16', 'PNL-17', 'PNL-18', 'PNL-19'];
const COIMBATORE_PANELS = ['PNL-05', 'PNL-06', 'PNL-07', 'PNL-20', 'PNL-21', 'PNL-22', 'PNL-23', 'PNL-24', 'PNL-25', 'PNL-26', 'PNL-27', 'PNL-28', 'PNL-29'];
const MADURAI_PANELS = ['PNL-08', 'PNL-09', 'PNL-30', 'PNL-31', 'PNL-32', 'PNL-33', 'PNL-34', 'PNL-35', 'PNL-36', 'PNL-37', 'PNL-38', 'PNL-39'];

const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENECO Chennai',
    location: 'Chennai, TN',
    status: 'Normal',
    panels: mockData.panels.filter(p => CHENNAI_PANELS.includes(p.id)),
    lat: 13.0827, lng: 80.2707
  },
  {
    id: 'PL-02',
    name: 'ENECO Coimbatore',
    location: 'Coimbatore, TN',
    status: 'Warning',
    panels: mockData.panels.filter(p => COIMBATORE_PANELS.includes(p.id)),
    lat: 11.0168, lng: 76.9558
  },
  {
    id: 'PL-03',
    name: 'ENECO Madurai',
    location: 'Madurai, TN',
    status: 'Normal',
    panels: mockData.panels.filter(p => MADURAI_PANELS.includes(p.id)),
    lat: 9.9252, lng: 78.1198
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative group w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input 
                type="text" 
                placeholder={selectedPlant ? "Search panels..." : "Search plants or location..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-surface/80 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent w-full sm:w-64 transition-all placeholder-secondary-text/70"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium mt-2 sm:mt-0">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success"></span> Normal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning"></span> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger"></span> Fault</span>
            </div>
          </div>
        </div>
        
        <div className={`flex-1 bg-gray-50 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center ${!selectedPlant ? 'p-0' : 'p-4 sm:p-8'}`}>
          
          {!selectedPlant ? (
            <div className="relative w-full h-[500px]">
              <MapComponent 
                plants={displayPlants} 
                onSelectPlant={(id) => {
                  setSelectedPlantId(id);
                  setSearchQuery("");
                }} 
              />
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
