"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X, ArrowRight, Info, Zap, BrainCircuit, MapPin, Wrench, Clock, AlertCircle } from 'lucide-react';
import { mockData } from '@/data/mock';

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
  emsState: any;
  automationMode: "Autonomous" | "Ask Permission" | "Manual";
  setAutomationMode: (mode: "Autonomous" | "Ask Permission" | "Manual") => void;
  timeString: string;
  simulateTimeTransition: (targetTime: string) => void;
  pendingPermission: string | null;
  approveAction: () => void;
  denyAction: () => void;
  setFactoryLoad: (mw: number) => void;
  setBatteryCapacity: (mwh: number) => void;
  setSolarGeneration: (mw: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const PLANTS = [
  { name: 'ENECO Chennai', location: 'Chennai, TN', panels: ['PNL-01', 'PNL-02', 'PNL-03', 'PNL-04', 'PNL-10', 'PNL-11', 'PNL-12', 'PNL-13', 'PNL-14', 'PNL-15', 'PNL-16', 'PNL-17', 'PNL-18', 'PNL-19'] },
  { name: 'ENECO Coimbatore', location: 'Coimbatore, TN', panels: ['PNL-05', 'PNL-06', 'PNL-07', 'PNL-20', 'PNL-21', 'PNL-22', 'PNL-23', 'PNL-24', 'PNL-25', 'PNL-26', 'PNL-27', 'PNL-28', 'PNL-29'] },
  { name: 'ENECO Madurai', location: 'Madurai, TN', panels: ['PNL-08', 'PNL-09', 'PNL-30', 'PNL-31', 'PNL-32', 'PNL-33', 'PNL-34', 'PNL-35', 'PNL-36', 'PNL-37', 'PNL-38', 'PNL-39'] },
];

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeSimulations, setActiveSimulations] = useState<SimulationEvent[]>([]);
  const [toastEvent, setToastEvent] = useState<SimulationEvent | null>(null);
  
  // Dynamic EMS State based on mockData
  const [emsState, setEmsState] = useState({
    currentPower: { ...mockData.currentPower },
    battery: { ...mockData.battery },
    aiDecision: { ...mockData.aiDecision },
    emsRecommendations: [...mockData.emsRecommendations],
    tariffs: { ...mockData.tariffs },
    costProjection: { ...mockData.costProjection }
  });

  const [timeString, setTimeString] = useState("14:30");
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [automationMode, setAutomationMode] = useState<"Autonomous" | "Ask Permission" | "Manual">("Autonomous");
  const [pendingPermission, setPendingPermission] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>(mockData.notifications);

  const triggerSimulation = (type: string) => {
    const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    const randomPanel = randomPlant.panels[Math.floor(Math.random() * randomPlant.panels.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let message = "";
    let isCritical = false;
    let newEmsState = { ...emsState };

    const isEmsScenario = ["Solar Surplus", "Solar Deficit", "Peak Tariff", "Upcoming Peak", "Battery Full", "Battery Reserve", "Storm Approaching", "Grid Outage", "Battery Failure", "Inverter Failure"].includes(type);
    if (isEmsScenario) {
      newEmsState.currentPower = {
        solarGenerationMw: 0,
        factoryLoadMw: 0,
        directToFactoryMw: 0,
        toBatteryMw: 0,
        toGridMw: 0,
        batteryChargeMw: 0,
        batteryDischargeMw: 0,
        gridImportMw: 0,
        gridExportMw: 0,
        surplusMw: 0,
        selfConsumptionRatio: 100
      };
    }

    if (type === 'Temperature Overload') {
      message = `Critical temperature threshold exceeded on ${randomPanel}. Derating output.`;
      isCritical = true;
    } else if (type === 'Communication Failure') {
      message = `Lost connection to ${randomPanel} telemetry module.`;
      isCritical = true;
    } else if (type === 'Voltage Drop') {
      message = `Unexpected DC voltage drop detected on ${randomPanel}.`;
      isCritical = true;
    } else if (type === 'Grid Outage') {
      message = `External grid failure detected. Entering Islanding Mode.`;
      isCritical = true;
      newEmsState.currentPower = { ...recalculatePowerFlows(newEmsState, newEmsState.currentPower.solarGenerationMw, newEmsState.currentPower.factoryLoadMw, newEmsState.battery.ratedCapacityMwh, true).currentPower };
      newEmsState.aiDecision = {
        action: "Islanding Mode Activated",
        reason: "Grid voltage dropped to 0V. Disconnected from grid to protect internal microgrid. Battery discharging to maintain factory load.",
        expectedImpact: "Operations maintained during blackout."
      };
    } else if (type === 'Battery Failure') {
      message = `BESS internal temperature critical. Emergency shutdown initiated.`;
      isCritical = true;
      newEmsState.battery.state = "Idle";
      newEmsState.currentPower = { ...recalculatePowerFlows(newEmsState, newEmsState.currentPower.solarGenerationMw, newEmsState.currentPower.factoryLoadMw, 0.001).currentPower };
      newEmsState.aiDecision = {
        action: "Battery Disconnected",
        reason: "Thermal runaway risk detected in Battery Rack B. Isolated battery system.",
        expectedImpact: "Increased grid reliance until maintenance arrives."
      };
    } else if (type === 'Inverter Failure') {
      message = `Central Inverter 2 tripped on over-voltage. Solar capacity reduced by 50%.`;
      isCritical = true;
      newEmsState.currentPower = { ...recalculatePowerFlows(newEmsState, newEmsState.currentPower.solarGenerationMw * 0.5, newEmsState.currentPower.factoryLoadMw, newEmsState.battery.ratedCapacityMwh).currentPower };
      newEmsState.aiDecision = {
        action: "Load Balancing",
        reason: "Solar generation plummeted due to inverter trip. Discharging battery to stabilize factory voltage.",
        expectedImpact: "Production continues uninterrupted."
      };
    } else if (type === 'Solar Surplus') {
      message = `Solar generation spiked. Redirecting surplus to battery storage.`;
      newEmsState.currentPower.solarGenerationMw = 2.80;
      newEmsState.currentPower.factoryLoadMw = 1.25;
      newEmsState.currentPower.directToFactoryMw = 1.25;
      newEmsState.currentPower.surplusMw = 1.55;
      newEmsState.currentPower.batteryChargeMw = 1.55;
      newEmsState.currentPower.toBatteryMw = 1.55;
      newEmsState.battery.state = "Charging";
      newEmsState.aiDecision = {
        action: "Charging Battery from Surplus",
        reason: "Solar generation is 1.55 MW above current demand. Storing surplus before evening peak.",
        expectedImpact: "Grid import avoided later. Estimated evening savings: ₹4,650."
      };
    } else if (type === 'Solar Deficit') {
      message = `Solar generation dropped. Discharging battery to cover factory load.`;
      newEmsState.currentPower.solarGenerationMw = 0.40;
      newEmsState.currentPower.factoryLoadMw = 2.20;
      newEmsState.currentPower.directToFactoryMw = 0.40;
      newEmsState.currentPower.batteryDischargeMw = 1.80;
      newEmsState.battery.state = "Discharging";
      newEmsState.aiDecision = {
        action: "Discharging Battery",
        reason: "Solar deficit of 1.80 MW detected. Grid tariff is ₹4.80/kWh, discharging battery is more economical.",
        expectedImpact: "Grid import reduced by 1.80 MW. Savings: ₹8,640/hr."
      };
    } else if (type === 'Peak Tariff') {
      message = `Peak tariff period started. Maximizing battery discharge.`;
      newEmsState.tariffs.current = 9.40;
      newEmsState.currentPower.solarGenerationMw = 0.00; // Corrected to 0 for night time
      newEmsState.currentPower.factoryLoadMw = 2.00;
      newEmsState.currentPower.directToFactoryMw = 0.00;
      newEmsState.currentPower.batteryDischargeMw = 2.00; // Fully covers load
      newEmsState.battery.state = "Discharging";
      newEmsState.aiDecision = {
        action: "Peak Shifting via Battery",
        reason: "Grid tariff is currently HIGH (₹9.40/kWh). Discharging battery to minimize grid import cost.",
        expectedImpact: "Grid import avoided. Peak savings: ₹18,800/hr."
      };
    } else if (type === 'Upcoming Peak') {
      message = `High tariff approaching in 30 mins. Preserving battery reserve.`;
      newEmsState.tariffs.current = 4.80;
      newEmsState.battery.state = "Reserve";
      const [h] = timeStr.split(':').map(Number);
      const isNight = h >= 19 || h < 6;
      newEmsState.currentPower.solarGenerationMw = isNight ? 0.0 : 0.8;
      newEmsState.currentPower.factoryLoadMw = 2.0;
      newEmsState.currentPower.directToFactoryMw = isNight ? 0.0 : 0.8;
      newEmsState.currentPower.gridImportMw = isNight ? 2.0 : 1.2;
      newEmsState.aiDecision = {
        action: "Preserve Battery Reserve",
        reason: "Peak tariff (₹9.40/kWh) begins in 30 mins. Holding current SoC to use during peak hours instead of now.",
        expectedImpact: "Cost shifted to cheaper grid period. Optimization value: ₹5,520."
      };
    } else if (type === 'Battery Full') {
      message = `Battery reached max capacity. Exporting surplus to grid.`;
      newEmsState.battery.soc = 100;
      newEmsState.battery.state = "Full";
      newEmsState.currentPower.solarGenerationMw = 2.5;
      newEmsState.currentPower.factoryLoadMw = 1.0;
      newEmsState.currentPower.directToFactoryMw = 1.0;
      newEmsState.currentPower.surplusMw = 1.5;
      newEmsState.currentPower.toGridMw = 1.5;
      newEmsState.currentPower.gridExportMw = 1.5;
      newEmsState.aiDecision = {
        action: "Exporting to Grid",
        reason: "Battery is at 100% capacity. Redirecting 1.50 MW solar surplus to the grid for revenue.",
        expectedImpact: "Grid export revenue generated: ₹7,200/hr."
      };
    } else if (type === 'Battery Reserve') {
      message = `Battery hit minimum reserve limit. Switching to grid.`;
      newEmsState.battery.soc = 25;
      newEmsState.battery.state = "Reserve";
      
      const [h] = timeStr.split(':').map(Number);
      const isNight = h >= 19 || h < 6;
      newEmsState.currentPower.solarGenerationMw = isNight ? 0.0 : 0.4;
      newEmsState.currentPower.factoryLoadMw = 1.8;
      newEmsState.currentPower.directToFactoryMw = isNight ? 0.0 : 0.4;
      newEmsState.currentPower.gridImportMw = isNight ? 1.8 : 1.4;
      
      newEmsState.aiDecision = {
        action: "Switched to Grid Import",
        reason: "Battery reached minimum reserve limit (25%). Switched to grid to protect battery health.",
        expectedImpact: "Battery degraded avoided. Safety margin maintained."
      };
    } else if (type === 'Storm Approaching') {
      message = `Storm forecasted for tomorrow. Pre-charging battery from grid at off-peak rates.`;
      newEmsState.tariffs.current = 4.80;
      newEmsState.battery.state = "Charging";
      newEmsState.currentPower.solarGenerationMw = 0.00;
      newEmsState.currentPower.directToFactoryMw = 0.00;
      newEmsState.currentPower.batteryChargeMw = 1.20;
      newEmsState.currentPower.factoryLoadMw = 1.50;
      newEmsState.currentPower.gridImportMw = 2.70;
      newEmsState.aiDecision = {
        action: "Pre-charging before Storm",
        reason: "Weather forecast predicts heavy rain tomorrow. Charging battery now at low tariff (₹4.80) to avoid importing expensive peak power tomorrow.",
        expectedImpact: "Grid import avoided tomorrow. Estimated savings: ₹8,000."
      };
    }

    setEmsState(newEmsState);

    const newSim: SimulationEvent = {
      id: Math.random().toString(36).substring(7),
      type,
      plantName: isCritical ? randomPlant.name : 'System EMS',
      panelId: isCritical ? randomPanel : 'EMS Engine',
      location: isCritical ? randomPlant.location : 'Global',
      time: timeStr,
      message,
      resolved: false
    };

    if (isCritical) {
      setActiveSimulations(prev => [newSim, ...prev]);
    }
    setToastEvent(newSim);

    setNotifications(prev => [
      {
        id: Math.random(),
        title: `${type}: ${isCritical ? randomPlant.name : 'EMS Action'}`,
        message: newSim.message,
        type: isCritical ? "critical" : "info",
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
  }

  const dismissToast = () => {
    setToastEvent(null);
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const simulateTimeTransition = (targetTimeStr: string) => {
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const currentMins = parseTime(timeString);
    const targetMins = parseTime(targetTimeStr);
    
    let current = currentMins;
    const step = targetMins > currentMins ? 10 : -10; // 10 min steps
    
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);

    timeIntervalRef.current = setInterval(() => {
      current += step;
      if ((step > 0 && current >= targetMins) || (step < 0 && current <= targetMins)) {
        current = targetMins;
        if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
        
        // Trigger context events based on the time we arrived at
        const h = parseInt(targetTimeStr.split(':')[0]);
        let nextSim = "";
        
        if (targetTimeStr === "18:00") nextSim = "Peak Tariff";
        else if (targetTimeStr === "12:00") nextSim = "Solar Surplus";
        else if (targetTimeStr === "17:00") nextSim = "Upcoming Peak";
        else if (targetTimeStr === "22:00") nextSim = "Storm Approaching";

        if (nextSim) {
          if (automationMode === "Ask Permission") {
            setPendingPermission(nextSim);
          } else if (automationMode === "Autonomous") {
            triggerSimulation(nextSim);
          }
        } else {
           // Normal diurnal update without triggering a toast alert
           setEmsState(prev => {
              // We only apply the natural curve if the user hasn't heavily modified it,
              // but to respect user intent ("no simply resetting"), we just recalculate based on their EXISTING load/solar sliders,
              // unless it's night time, in which case we strictly zero out solar.
              
              let newSolarMw = prev.currentPower.solarGenerationMw;
              let newLoadMw = prev.currentPower.factoryLoadMw;
              
              if (h >= 19 || h < 6) {
                newSolarMw = 0.00; // Physics: no solar at night
              }
              
              const isGridOutage = prev.aiDecision?.action === "Islanding Mode Activated";
              const updated = recalculatePowerFlows(prev, newSolarMw, newLoadMw, prev.battery.ratedCapacityMwh, isGridOutage);
              
              if (h >= 18 && h < 23) updated.tariffs.current = 9.40;
              else if (h >= 14 && h < 18) updated.tariffs.current = 4.80;
              else if (h >= 23 || h < 10) updated.tariffs.current = 5.10;
              else updated.tariffs.current = 5.20;
              
              // Only overwrite AI decision if not in a critical state
              if (!isGridOutage && !prev.battery.state.includes("Idle")) {
                updated.aiDecision = {
                  action: "Normal Operations",
                  reason: "Standard power flow balancing based on current load and tariff schedule.",
                  expectedImpact: "System maintaining nominal efficiency."
                };
              }
              
              return updated;
           });
        }
      }
      
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      setTimeString(`${h}:${m}`);
    }, 50);
  };

  const approveAction = () => {
    if (pendingPermission) {
      triggerSimulation(pendingPermission);
      setPendingPermission(null);
    }
  };

  const denyAction = () => {
    setPendingPermission(null);
  };

  const recalculatePowerFlows = (prev: any, solarMw: number, loadMw: number, capacityMwh: number, forceGridZero: boolean = false) => {
    const soc = prev.battery.soc;
    const usableEnergy = capacityMwh * (soc / 100);
    const maxChargePower = capacityMwh * 0.5; // 0.5C charge rate
    const maxDischargePower = capacityMwh * 1.0; // Allowed 1.0C discharge for emergencies

    let directToFactoryMw = 0;
    let surplusMw = 0;
    let deficitMw = 0;
    
    let batteryChargeMw = 0;
    let batteryDischargeMw = 0;
    let gridImportMw = 0;
    let gridExportMw = 0;
    
    let toBatteryMw = 0;
    let toGridMw = 0;
    let batteryState = prev.battery.state === "Idle" ? "Idle" : "Standby";

    if (solarMw >= loadMw) {
      directToFactoryMw = loadMw;
      surplusMw = solarMw - loadMw;
      
      if (soc < 100 && batteryState !== "Idle") {
        batteryChargeMw = Math.min(surplusMw, maxChargePower);
        toBatteryMw = batteryChargeMw;
        batteryState = "Charging";
      }
      
      if (!forceGridZero) {
        gridExportMw = surplusMw - batteryChargeMw;
        toGridMw = gridExportMw;
      }
    } else {
      directToFactoryMw = solarMw;
      deficitMw = loadMw - solarMw;
      
      if (soc > 10 && batteryState !== "Idle") { 
        if (forceGridZero) {
          // If no grid, battery MUST cover the entire deficit, up to its physical limit
          batteryDischargeMw = Math.min(deficitMw, maxDischargePower);
        } else {
          // Normal case: optimize discharge (e.g. 0.5C normal rate)
          batteryDischargeMw = Math.min(deficitMw, capacityMwh * 0.5);
        }
        if (batteryDischargeMw > 0) batteryState = "Discharging";
      }
      
      if (!forceGridZero) {
        gridImportMw = deficitMw - batteryDischargeMw;
      } else {
        // Islanding mode: Grid is 0. If battery can't cover it, load must be curtailed.
        if (batteryDischargeMw < deficitMw) {
          loadMw = solarMw + batteryDischargeMw; // Curtail load to match available power exactly
        }
      }
    }

    if (soc === 100 && batteryState === "Standby") batteryState = "Full";
    if (soc <= 10 && batteryState === "Standby") batteryState = "Reserve";

    const totalConsumption = loadMw;
    const selfConsumed = directToFactoryMw + batteryDischargeMw;
    const selfConsumptionRatio = totalConsumption > 0 ? Math.min(100, Math.round((selfConsumed / totalConsumption) * 100)) : 100;

    return {
      ...prev,
      battery: {
        ...prev.battery,
        state: batteryState,
        ratedCapacityMwh: capacityMwh,
        usableEnergyMwh: Number(usableEnergy.toFixed(2))
      },
      currentPower: {
        ...prev.currentPower,
        solarGenerationMw: solarMw,
        factoryLoadMw: loadMw,
        directToFactoryMw,
        toBatteryMw,
        toGridMw,
        batteryChargeMw,
        batteryDischargeMw,
        gridImportMw,
        gridExportMw,
        surplusMw,
        selfConsumptionRatio
      }
    };
  };

  const setFactoryLoad = (mw: number) => {
    setEmsState(prev => recalculatePowerFlows(prev, prev.currentPower.solarGenerationMw, mw, prev.battery.ratedCapacityMwh));
  };

  const setSolarGeneration = (mw: number) => {
    const [h, m] = timeString.split(':').map(Number);
    const timeVal = h + m / 60;
    const isNight = timeVal >= 19 || timeVal < 6;
    
    // Completely reject any solar generation during night hours
    const finalMw = isNight ? 0 : mw;
    setEmsState(prev => recalculatePowerFlows(prev, finalMw, prev.currentPower.factoryLoadMw, prev.battery.ratedCapacityMwh));
  };

  const setBatteryCapacity = (mwh: number) => {
    setEmsState(prev => recalculatePowerFlows(prev, prev.currentPower.solarGenerationMw, prev.currentPower.factoryLoadMw, mwh));
  };

  const [isGlobalErrorModalOpen, setIsGlobalErrorModalOpen] = useState(false);

  const contextValue = React.useMemo(() => ({
    activeSimulations, 
    triggerSimulation, 
    fixSimulation, 
    toastEvent, 
    dismissToast,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    emsState,
    automationMode,
    setAutomationMode,
    timeString,
    simulateTimeTransition,
    pendingPermission,
    approveAction,
    denyAction,
    setFactoryLoad,
    setBatteryCapacity,
    setSolarGeneration
  }), [activeSimulations, toastEvent, notifications, emsState, automationMode, timeString, pendingPermission]);

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
      
      {/* Permission Modal */}
      {pendingPermission && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] animate-in zoom-in-95">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 border-4 border-blue-100">
                <BrainCircuit size={24} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">AI Action Requires Approval</h3>
             <p className="text-sm text-gray-600 mb-6">
               The EMS AI wants to execute: <strong className="text-blue-600">{pendingPermission}</strong>. 
               Do you approve this automated decision?
             </p>
             <div className="flex gap-3">
                <button onClick={denyAction} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                  Deny
                </button>
                <button onClick={approveAction} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20">
                  Approve & Execute
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Toast Modal (New Event) */}
      {toastEvent && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-5 w-[420px] max-w-[90vw] overflow-hidden relative">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'from-red-600 via-red-400 to-red-600' : 'from-blue-600 via-emerald-400 to-blue-600'}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'} border flex items-center justify-center relative`}>
                   {toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? (
                     <>
                       <span className="absolute inset-0 rounded-full animate-ping bg-red-400/20 duration-1000"></span>
                       <AlertTriangle size={20} className="text-red-500 relative z-10" />
                     </>
                   ) : (
                     <Zap size={20} className="text-blue-500 relative z-10" />
                   )}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-wide leading-tight">
                    {toastEvent.type}
                  </h3>
                  <div className={`${toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'text-red-500' : 'text-blue-500'} text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></span>
                    {toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'Critical System Alert' : 'EMS Optimization Alert'}
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
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Affected Area</div>
                <div className="text-sm font-bold text-gray-900 truncate">{toastEvent.plantName}</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Asset ID / Subsystem</div>
                <div className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                  <span className={`${toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop') ? 'text-red-500' : 'text-blue-500'}`}>•</span> {toastEvent.panelId}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button onClick={dismissToast} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all border border-transparent cursor-pointer">
                Dismiss
              </button>
              {(toastEvent.type.includes('Failure') || toastEvent.type.includes('Overload') || toastEvent.type.includes('Drop')) && (
                <button className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-red-100 font-bold text-sm shadow-sm transition-all border flex items-center justify-center gap-2 group cursor-pointer" onClick={() => { dismissToast(); setIsGlobalErrorModalOpen(true); }}>
                  Review Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Active Events */}
      {activeSimulations.length > 0 && !isGlobalErrorModalOpen && (
        <button 
          onClick={() => setIsGlobalErrorModalOpen(true)}
          className="fixed bottom-24 right-6 z-[90] w-14 h-14 bg-danger rounded-full shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center animate-shake-periodic border-2 border-white hover:scale-110 transition-transform cursor-pointer group"
          aria-label="Active Events"
        >
          <AlertTriangle size={28} className="text-white" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-danger font-black text-xs rounded-full flex items-center justify-center border-2 border-danger shadow-md">
            {activeSimulations.length}
          </span>
        </button>
      )}

      {/* Central Global Modal */}
      {isGlobalErrorModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[800px] max-w-[95vw] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active System Events</h2>
                  <p className="text-sm text-gray-500">Critical issues and active EMS simulations</p>
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
              <div className="flex flex-col gap-4">
                {activeSimulations.map(sim => (
                  <SimulationEventCard key={sim.id} sim={sim} fixSimulation={fixSimulation} />
                ))}
              </div>
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

const SimulationEventCard = ({ sim, fixSimulation }: { sim: SimulationEvent, fixSimulation: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCritical = sim.type.includes('Failure') || sim.type.includes('Overload') || sim.type.includes('Drop') || sim.type.includes('Outage');
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className={`w-12 h-12 shrink-0 rounded-xl ${isCritical ? 'bg-red-50 border-red-100 text-red-500' : 'bg-blue-50 border-blue-100 text-blue-500'} border flex items-center justify-center`}>
          {isCritical ? <AlertTriangle size={24} /> : <Zap size={24} />}
        </div>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">{sim.type}</span>
            <span className={`shrink-0 px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'} border text-[10px] font-bold uppercase`}>Active</span>
          </div>
          <p className="text-xs text-gray-600 leading-snug">{sim.message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
          <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs transition-colors"
          >
             {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
          <button 
            onClick={() => fixSimulation(sim.id)}
            className={`px-6 py-2.5 rounded-lg ${isCritical ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-900/20'} text-white font-bold text-sm transition-colors shadow-sm`}
          >
            {isCritical ? 'Fix Issue' : 'End Simulation'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
           <div>
             <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Location</div>
             <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {sim.plantName}</div>
           </div>
           <div>
             <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Asset / Subsystem</div>
             <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Wrench size={14} className="text-gray-400"/> {sim.panelId}</div>
           </div>
           <div>
             <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Time Reported</div>
             <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {new Date().toLocaleTimeString()}</div>
           </div>
           <div>
             <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Status</div>
             <div className="text-sm font-semibold text-amber-600 flex items-center gap-1.5"><AlertCircle size={14} className="text-amber-500"/> Pending Resolution</div>
           </div>
        </div>
      )}
    </div>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within SimulationProvider");
  return context;
};
