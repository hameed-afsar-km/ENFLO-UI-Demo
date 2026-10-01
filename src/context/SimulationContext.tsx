"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
      
      {/* Toast Modal */}
      {toastEvent && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white border-l-4 border-l-danger shadow-2xl rounded-xl p-5 w-[400px] max-w-[90vw]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-danger text-lg flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                </span>
                {toastEvent.type}
              </h3>
              <button onClick={dismissToast} className="text-secondary-text hover:text-primary-text font-bold">×</button>
            </div>
            
            <p className="text-sm font-medium text-primary-text mb-4">{toastEvent.message}</p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs font-semibold text-secondary-text grid grid-cols-2 gap-y-2">
              <div>Plant: <span className="text-primary-text">{toastEvent.plantName}</span></div>
              <div>Panel: <span className="text-primary-text">{toastEvent.panelId}</span></div>
              <div>Location: <span className="text-primary-text">{toastEvent.location}</span></div>
              <div>Time: <span className="text-primary-text">{toastEvent.time}</span></div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={dismissToast} className="flex-1 py-2 rounded-lg bg-gray-100 text-secondary-text font-bold text-sm hover:bg-gray-200 transition-colors">
                Dismiss
              </button>
              <button className="flex-1 py-2 rounded-lg bg-danger text-white font-bold text-sm hover:bg-red-600 shadow-md shadow-danger/20 transition-colors">
                Go to Dashboard
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
