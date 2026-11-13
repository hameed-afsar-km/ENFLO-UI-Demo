"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";
import { Search, ChevronLeft, MapPin, Zap, ArrowRight } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border-4 border-white shadow-inner font-bold text-gray-400">Loading Map...</div>
});

const CHENNAI_PANELS = ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04', 'PNL-10', 'PNL-11', 'PNL-12', 'PNL-13', 'PNL-14', 'PNL-15', 'PNL-16', 'PNL-17', 'PNL-18', 'PNL-19'];
const COIMBATORE_PANELS = ['PNL-05', 'PNL-06', 'PNL-07', 'PNL-20', 'PNL-21', 'PNL-22', 'PNL-23', 'PNL-24', 'PNL-25', 'PNL-26', 'PNL-27', 'PNL-28', 'PNL-29'];
const MADURAI_PANELS = ['PNL-08', 'PNL-09', 'PNL-30', 'PNL-31', 'PNL-32', 'PNL-33', 'PNL-34', 'PNL-35', 'PNL-36', 'PNL-37', 'PNL-38', 'PNL-39'];

const computePlantStatus = (panels: any[]) => {
  if (panels.some(p => p.status === 'Critical' || p.status === 'Fault' || p.status === 'Error')) return 'Fault';
  if (panels.some(p => p.status === 'Warning')) return 'Warning';
  return 'Normal';
};

const chennaiPanels = mockData.panels.filter(p => CHENNAI_PANELS.includes(p.id));
const coimbatorePanels = mockData.panels.filter(p => COIMBATORE_PANELS.includes(p.id));
const maduraiPanels = mockData.panels.filter(p => MADURAI_PANELS.includes(p.id));

const PLANTS = [
  {
    id: 'PL-01',
    name: 'ENERCO Chennai',
    location: 'Chennai, TN',
    status: computePlantStatus(chennaiPanels),
    panels: chennaiPanels,
    lat: 13.0827, lng: 80.2707
  },
  {
    id: 'PL-02',
    name: 'ENERCO Coimbatore',
    location: 'Coimbatore, TN',
    status: computePlantStatus(coimbatorePanels),
    panels: coimbatorePanels,
    lat: 11.0168, lng: 76.9558
  },
  {
    id: 'PL-03',
    name: 'ENERCO Madurai',
    location: 'Madurai, TN',
    status: computePlantStatus(maduraiPanels),
    panels: maduraiPanels,
    lat: 9.9252, lng: 78.1198
  }
];

export default function PlantMapPage() {
  const router = useRouter();
  const { selectedPlant: contextPlant, setSelectedPlant, setSelectedPanel, activeSimulations } = useSimulation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const selectedPlant = PLANTS.find(p => p.id === selectedPlantId);

  const handleSelectPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
    setSearchQuery("");
    const plant = PLANTS.find(p => p.id === plantId);
    if (plant) {
      setSelectedPlant(plant.name);
    }
  };

  const handleSelectPanelAndNavigate = (panelId: string) => {
    if (selectedPlant) {
      setSelectedPlant(selectedPlant.name);
      setSelectedPanel(panelId);
      router.push("/");
    }
  };

  // Filter Plants if no plant is selected, otherwise filter panels within the selected plant
  const displayPlants = PLANTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayPanels = selectedPlant?.panels.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(p => {
    const isError = activeSimulations.some(sim => sim.plantName === selectedPlant.name && sim.panelId === p.id);
    return isError ? { ...p, status: 'Critical', acKw: 0, dcKw: 0, eff: 0 } : p;
  }) || [];

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
                title="Back to Map View"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-primary-text">
              {selectedPlant ? `Plant Panels: ${selectedPlant.name}` : "Interactive Plant Map - Tamil Nadu"}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative group w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input 
                type="text" 
                placeholder={selectedPlant ? "Search panels (e.g. PNL-01)..." : "Search plants or location..."}
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
                onSelectPlant={handleSelectPlant} 
              />
            </div>
          ) : (
            // Show Panels for selected plant
            <div className="w-full max-w-5xl relative z-10 flex flex-col h-full">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-blue-50/80 border border-blue-200/60 px-4 py-3 rounded-xl shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-sm text-blue-950 font-bold">{selectedPlant.name}</div>
                    <div className="text-xs text-blue-700 font-medium">{selectedPlant.panels.length} panels in this plant location</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                  <span>Click any panel to take dashboard to it</span>
                  <ArrowRight size={14} className="text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                {displayPanels.map((panel) => (
                  <div 
                    key={panel.id}
                    onClick={() => handleSelectPanelAndNavigate(panel.id)}
                    className="bg-white border-2 border-border shadow-xs p-4 rounded-xl flex flex-col hover:border-accent hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden"
                    title={`Click to open ${panel.id} in Dashboard`}
                  >
                    <div className="flex justify-between items-center w-full mb-2.5">
                      <span className={`w-3 h-3 rounded-full shadow-xs ${
                        panel.status === 'Normal' ? 'bg-success' : 
                        panel.status === 'Warning' ? 'bg-warning' : 'bg-danger animate-pulse'
                      }`}></span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        panel.status === 'Normal' ? 'bg-success/10 text-success' :
                        panel.status === 'Warning' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                      }`}>
                        {panel.status}
                      </span>
                    </div>

                    <div className="font-extrabold text-lg text-primary-text group-hover:text-accent-dark transition-colors flex items-center gap-1.5">
                      <Zap size={16} className="text-amber-500" />
                      {panel.id}
                    </div>

                    <div className="mt-2 space-y-0.5 text-xs">
                      <div className="font-semibold text-primary-text">{panel.acKw} kW AC</div>
                      <div className="text-secondary-text text-[11px]">{panel.eff}% Eff • {panel.temp}°C</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-accent-dark font-bold text-[11px]">
                      <span>Open in Dashboard</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
                {displayPanels.length === 0 && (
                  <div className="col-span-full text-center py-10 text-secondary-text font-medium bg-white rounded-xl border border-dashed border-border">
                    No panels match "{searchQuery}" in {selectedPlant.name}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
