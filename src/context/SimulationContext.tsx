"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
export type SimulationEvent = {
  id: string;
  type: string;
  plantName: string;
  panelId: string;
  location: string;
  time: string;
  message: string;
  resolved: boolean;
};

interface SimulationContextType {
  activeSimulations: SimulationEvent[];
  triggerSimulation: (type: string) => void;
  fixSimulation: (id: string) => void;
  toastEvent: SimulationEvent | null;
  dismissToast: () => void;
  notifications: any[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const PLANTS = [
  { name: 'ENFLO Chennai', location: 'Chennai, TN', panels: ['INV-01', 'INV-02', 'INV-03', 'INV-04'] },
  { name: 'ENFLO Coimbatore', location: 'Coimbatore, TN', panels: ['INV-05', 'INV-06', 'INV-07'] },
  { name: 'ENFLO Madurai', location: 'Madurai, TN', panels: ['INV-08', 'INV-09'] },
];

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [activeSimulations, setActiveSimulations] = useState<SimulationEvent[]>([]);
  const [toastEvent, setToastEvent] = useState<SimulationEvent | null>(null);
  
  // Base notifications mock
  const [notifications, setNotifications] = useState<any[]>([
    { id: 101, title: "System check complete", message: "All regular diagnostics passed.", type: "info", time: "08:00", read: true }
  ]);

  const triggerSimulation = (type: string) => {
    const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    const randomPanel = randomPlant.panels[Math.floor(Math.random() * randomPlant.panels.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let message = "";
    if (type === 'Temperature Overload') message = `Critical temperature threshold exceeded on ${randomPanel}. Derating output.`;
    else if (type === 'Communication Failure') message = `Lost connection to ${randomPanel} telemetry module.`;
    else if (type === 'Voltage Drop') message = `Unexpected DC voltage drop detected on ${randomPanel}.`;

    const newSim: SimulationEvent = {
      id: Math.random().toString(36).substring(7),
      type,
      plantName: randomPlant.name,
      panelId: randomPanel,
      location: randomPlant.location,
      time: timeStr,
      message,
      resolved: false
    };

    setActiveSimulations(prev => [newSim, ...prev]);
    setToastEvent(newSim);

    // Add to notifications
    setNotifications(prev => [
      {
        id: Math.random(),
        title: `${type}: ${randomPlant.name}`,
        message: newSim.message,
        type: "critical",
        time: timeStr,
        read: false
      },
      ...prev
    ]);
  };

  const fixSimulation = (id: string) => {
    setActiveSimulations(prev => prev.filter(sim => sim.id !== id));
    if (toastEvent?.id === id) {
      setToastEvent(null);
    }
  };

  const dismissToast = () => {
    setToastEvent(null);
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const [isGlobalErrorModalOpen, setIsGlobalErrorModalOpen] = useState(false);

  return (
    <SimulationContext.Provider value={{ 
      activeSimulations, 
      triggerSimulation, 
      fixSimulation, 
      toastEvent, 
      dismissToast,
      notifications,
      markNotificationRead,
      markAllNotificationsRead
    }}>
      {children}
      
      {/* Toast Modal (New Event) */}
      {toastEvent && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_20px_50px_-12px_rgba(239,68,68,0.25)] rounded-2xl p-5 w-[420px] max-w-[90vw] overflow-hidden relative">
            {/* Glowing top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center relative">
                   <span className="absolute inset-0 rounded-full animate-ping bg-red-400/20 duration-1000"></span>
                   <AlertTriangle size={20} className="text-red-500 relative z-10" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-wide leading-tight">
                    {toastEvent.type}
                  </h3>
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Critical System Alert
                  </div>
                </div>
              </div>
              <button onClick={dismissToast} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <p className="text-sm font-medium text-gray-600 mb-5 leading-relaxed">{toastEvent.message}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Affected Plant</div>
                <div className="text-sm font-bold text-gray-900 truncate">{toastEvent.plantName}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Asset ID</div>
                <div className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                  <span className="text-red-500">•</span> {toastEvent.panelId}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button onClick={dismissToast} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all border border-transparent cursor-pointer">
                Dismiss
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 shadow-sm transition-all border border-red-100 flex items-center justify-center gap-2 group cursor-pointer" onClick={() => { dismissToast(); setIsGlobalErrorModalOpen(true); }}>
                Review Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Active Errors */}
      {activeSimulations.length > 0 && !isGlobalErrorModalOpen && (
        <button 
          onClick={() => setIsGlobalErrorModalOpen(true)}
          className="fixed bottom-24 right-6 z-[90] w-14 h-14 bg-danger rounded-full shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center animate-shake-periodic border-2 border-white hover:scale-110 transition-transform cursor-pointer group"
          aria-label="Active Errors"
        >
          <AlertTriangle size={28} className="text-white" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-danger font-black text-xs rounded-full flex items-center justify-center border-2 border-danger shadow-md">
            {activeSimulations.length}
          </span>
          <div className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            View Active Issues
          </div>
        </button>
      )}

      {/* Central Global Error Modal */}
      {isGlobalErrorModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[600px] max-w-[95vw] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active System Alerts</h2>
                  <p className="text-sm text-gray-500">Critical issues requiring immediate action</p>
                </div>
              </div>
              <button 
                onClick={() => setIsGlobalErrorModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {activeSimulations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4 border border-green-100">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear</h3>
                  <p className="text-gray-500 text-sm">No active issues detected across all plants.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeSimulations.map(sim => (
                    <div key={sim.id} className="bg-white border border-red-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 truncate">{sim.type}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase">Critical</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 leading-snug">{sim.message}</p>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1"><span className="text-gray-400">Plant:</span> <span className="text-gray-700">{sim.plantName}</span></span>
                          <span className="flex items-center gap-1"><span className="text-gray-400">Asset:</span> <span className="text-gray-700">{sim.panelId}</span></span>
                          <span className="flex items-center gap-1"><span className="text-gray-400">Time:</span> <span className="text-gray-700">{sim.time}</span></span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                        <button 
                          onClick={() => {
                            window.location.href = `/assets?plantName=${encodeURIComponent(sim.plantName)}`;
                            setIsGlobalErrorModalOpen(false);
                          }}
                          className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors text-center"
                        >
                          View Assets
                        </button>
                        <button 
                          onClick={() => fixSimulation(sim.id)}
                          className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-sm shadow-green-500/20"
                        >
                          Fix Issue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end rounded-b-2xl">
              <button 
                onClick={() => setIsGlobalErrorModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within SimulationProvider");
  return context;
};
