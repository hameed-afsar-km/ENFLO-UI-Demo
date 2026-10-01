import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { mockData } from "@/data/mock";

import { MapPin, ChevronDown } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-0 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border bg-gray-50/50 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-primary-text">Asset Management</h2>
            <p className="text-sm text-secondary-text mt-1">Manage and monitor all plant hardware assets.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-primary-text hover:border-accent transition-colors shadow-sm group">
            <MapPin size={16} className="text-secondary-text group-hover:text-accent-dark" />
            <span>Select Plant: <span className="font-bold ml-1">ENFLO MAIN</span></span>
            <ChevronDown size={16} className="text-secondary-text ml-1" />
          </button>
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
            <tbody className="divide-y divide-border/50 text-sm">
              {mockData.inverters.map((inv) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
