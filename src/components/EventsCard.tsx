"use client";

import React from 'react';
import Link from 'next/link';
import { mockData } from '@/data/mock';
import { AlertCircle, AlertTriangle, Info, ArrowRight, HelpCircle } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';

export function EventsCard() {
  const { activeSimulations } = useSimulation();
  const events = mockData.events;
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'info': return <Info size={16} className="text-info" />;
      case 'warning': return <AlertTriangle size={16} className="text-warning" />;
      case 'critical': return <AlertCircle size={16} className="text-danger" />;
      case 'maintenance': return <AlertCircle size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-secondary-text" />;
    }
  };

  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Active Events</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info/10 text-info text-xs font-bold">3</span>
             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">1</span>
             <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${activeSimulations.length > 0 ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>{activeSimulations.length}</span>
          </div>
          <div className="tooltip-trigger">
            <HelpCircle size={18} />
            <div className="tooltip-content">
              <strong>Answers:</strong> What operational events or alarms need attention?
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
        {activeSimulations.map((sim) => (
          <div key={sim.id} className="flex gap-3 p-3 rounded-xl border border-danger/30 bg-danger/5 hover:bg-danger/10 transition-colors shadow-sm">
            <div className="mt-0.5">
              {getIcon('critical')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-danger">{sim.plantName} - {sim.panelId}</span>
                <span className="text-xs font-medium text-danger">{sim.time}</span>
              </div>
              <p className="text-sm font-bold text-primary-text leading-tight mb-1">{sim.type}</p>
              <p className="text-xs text-secondary-text leading-tight">{sim.message}</p>
            </div>
          </div>
        ))}
        
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-surface hover:bg-gray-50 transition-colors">
            <div className="mt-0.5">
              {getIcon(event.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary-text">{event.asset}</span>
                <span className="text-xs font-medium text-secondary-text">{event.time}</span>
              </div>
              <p className="text-sm text-secondary-text leading-tight">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Link href="/assets" className="mt-4 btn-action">
        View all events
        <ArrowRight size={16} className="text-secondary-text ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}
