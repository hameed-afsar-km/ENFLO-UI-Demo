import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";

export default function PlantMapPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-6 min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-primary-text">Interactive Plant Map</h2>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success"></span> Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning"></span> Warning</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger"></span> Fault</span>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-50 rounded-xl border border-border/50 p-8 relative overflow-hidden flex items-center justify-center">
          {/* Mocked structural layout for a plant map */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl relative z-10">
            {mockData.inverters.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white border-2 border-border shadow-sm p-4 rounded-xl flex flex-col items-center hover:border-accent hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-4 h-4 rounded-full mb-3 shadow-sm ${
                  inv.status === 'Normal' ? 'bg-success' : 
                  inv.status === 'Warning' ? 'bg-warning' : 'bg-danger'
                }`}></div>
                <div className="font-bold text-primary-text">{inv.id}</div>
                <div className="text-xs font-medium text-secondary-text mt-1">{inv.acKw} kW AC</div>
                <div className="text-xs font-medium text-secondary-text">{inv.eff}% Eff</div>
                
                <div className="mt-4 pt-3 border-t border-border/50 w-full flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-accent-dark font-bold">Details</span>
                  <span className="text-accent-dark">→</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0D9488 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
      </div>
    </div>
  );
}
