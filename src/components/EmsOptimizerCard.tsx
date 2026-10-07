"use client";

import React from 'react';
import { BrainCircuit, TrendingDown, ArrowRight, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';

export function EmsOptimizerCard() {
  const { emsState, automationMode, setAutomationMode } = useSimulation();
  const { aiDecision, emsRecommendations } = emsState;

  return (
    <div className="solid-card p-6 flex flex-col h-full group bg-gradient-to-br from-surface to-[#f8fafc]">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit size={18} className="text-blue-500" /> AI Decision Engine
        </h2>
        <div className="flex items-center gap-2">
          <select 
             value={automationMode} 
             onChange={(e) => setAutomationMode(e.target.value as any)}
             className="text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer uppercase tracking-wider"
          >
             <option value="Autonomous">Autonomous</option>
             <option value="Ask Permission">Ask Permission</option>
             <option value="Manual">Manual</option>
          </select>
          
          <div className={`px-2 py-1 ${automationMode === 'Manual' ? 'bg-gray-100 text-gray-600 border-gray-200' : automationMode === 'Ask Permission' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'} text-[10px] font-bold rounded-lg border uppercase tracking-wide flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${automationMode === 'Manual' ? 'bg-gray-400' : automationMode === 'Ask Permission' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></span> {automationMode === 'Manual' ? 'Off' : 'Active'}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 justify-between">
        {/* Main AI Decision Box */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-wider flex items-center gap-1">
             Recommendation
          </div>
          <div className="font-black text-lg text-gray-900 mb-2">{aiDecision.action}</div>
          
          <div className="mb-3">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Why?</div>
            <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100">
              {aiDecision.reason}
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Expected Impact</div>
            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
              <TrendingDown size={14} /> {aiDecision.expectedImpact}
            </div>
          </div>
        </div>

        {/* Secondary Recommendations */}
        <div className="mt-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Secondary Actions</div>
          <div className="flex flex-col gap-2">
            {emsRecommendations.map((rec: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className={`mt-0.5 p-1 rounded-full ${rec.priority === 'high' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                   {rec.priority === 'high' ? <Zap size={12} /> : <Lightbulb size={12} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">{rec.action}</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{rec.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
