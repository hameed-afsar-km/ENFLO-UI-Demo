"use client";

import React from 'react';
import { mockData } from '@/data/mock';
import { ArrowRight, TrendingUp, HelpCircle } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ForecastCard() {
  const { emsState } = useSimulation();
  const { pvGenerationMwh, pvUncertainty, factoryDemandMwh, demandUncertainty, expectedEveningPeak } = emsState.forecastTomorrow || mockData.forecastTomorrow;
  const { hourlyForecast } = mockData;

  return (
    <div className="solid-card p-6 flex flex-col h-full lg:col-span-2 group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Energy Forecast</h2>
        <div className="tooltip-trigger">
          <HelpCircle size={18} />
          <div className="tooltip-content w-56">
            <strong>Answers:</strong> What will tomorrow's generation and demand be?
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col justify-between w-full lg:w-1/3 space-y-6">
          <div>
            <div className="text-xs text-secondary-text font-bold mb-1 flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-200"></span> Tomorrow PV
            </div>
            <div className="text-3xl font-bold text-primary-text tracking-tight">
              {pvGenerationMwh} <span className="text-sm font-medium text-secondary-text">± {pvUncertainty} MWh</span>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-secondary-text font-bold mb-1 flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span> Tomorrow Load
            </div>
            <div className="text-3xl font-bold text-primary-text tracking-tight">
              {factoryDemandMwh} <span className="text-sm font-medium text-secondary-text">± {demandUncertainty} MWh</span>
            </div>
          </div>
          
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="text-xs text-accent-dark font-bold mb-1 uppercase">Expected evening peak</div>
            <div className="text-lg font-bold text-primary-text">{expectedEveningPeak}</div>
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 h-64 lg:h-auto min-h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 600 }}
                labelStyle={{ color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} type="monotone" dataKey="load" name="Load (MW)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
              <Area activeDot={{ r: 6, strokeWidth: 0, fill: '#fb923c' }} type="monotone" dataKey="pv" name="PV (MW)" stroke="#fb923c" strokeWidth={4} fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
