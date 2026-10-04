"use client";

import React, { useState } from 'react';
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { Search } from 'lucide-react';

const solarVsLoadData = [
  { time: '00:00', solar: 0, load: 1.2 },
  { time: '04:00', solar: 0, load: 1.1 },
  { time: '08:00', solar: 0.8, load: 1.8 },
  { time: '12:00', solar: 2.4, load: 2.1 },
  { time: '16:00', solar: 1.8, load: 2.0 },
  { time: '20:00', solar: 0, load: 1.5 },
];

const batteryData = [
  { time: '00:00', soc: 40, charge: 0, discharge: 0.5 },
  { time: '04:00', soc: 20, charge: 0, discharge: 0.3 },
  { time: '08:00', soc: 25, charge: 0.4, discharge: 0 },
  { time: '12:00', soc: 80, charge: 1.2, discharge: 0 },
  { time: '16:00', soc: 100, charge: 0, discharge: 0 },
  { time: '20:00', soc: 70, charge: 0, discharge: 1.2 },
];

const gridData = [
  { time: '00:00', import: 0.7, export: 0 },
  { time: '04:00', import: 0.8, export: 0 },
  { time: '08:00', import: 1.0, export: 0 },
  { time: '12:00', import: 0, export: 0.3 },
  { time: '16:00', import: 0, export: 0 },
  { time: '20:00', import: 0.3, export: 0 },
];

const tariffCostData = [
  { time: '00:00', tariff: 5.10, cost: 3500 },
  { time: '04:00', tariff: 5.10, cost: 4000 },
  { time: '08:00', tariff: 5.20, cost: 5200 },
  { time: '12:00', tariff: 4.80, cost: 0 },
  { time: '16:00', tariff: 4.80, cost: 0 },
  { time: '20:00', tariff: 9.40, cost: 2800 },
];

const savingsData = [
  { day: 'Mon', withoutEms: 32000, withEms: 21000, savings: 11000 },
  { day: 'Tue', withoutEms: 34000, withEms: 22000, savings: 12000 },
  { day: 'Wed', withoutEms: 31000, withEms: 19000, savings: 12000 },
  { day: 'Thu', withoutEms: 36000, withEms: 20000, savings: 16000 },
  { day: 'Fri', withoutEms: 33000, withEms: 21500, savings: 11500 },
];

export default function AnalyticsPage() {
  const tabs = ['Solar vs Load', 'Battery', 'Grid', 'Tariff & Cost', 'EMS Savings'];
  const [activeTab, setActiveTab] = useState('Solar vs Load');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-6 min-h-[600px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-2">Energy & Optimization Analytics</h2>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'bg-white text-gray-500 border border-transparent hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative group w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search metrics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {activeTab === 'Solar vs Load' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Solar Generation vs Factory Load</h3>
                  <p className="text-sm text-gray-500">Comparing energy production against consumption.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={solarVsLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="solar" name="Solar Generation (MW)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSolar)" />
                    <Area type="step" dataKey="load" name="Factory Load (MW)" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Battery' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Battery Charge & Discharge Profile</h3>
                  <p className="text-sm text-gray-500">Tracking State of Charge (SoC) against charge/discharge power.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={batteryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar yAxisId="left" dataKey="charge" name="Charge (MW)" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar yAxisId="left" dataKey="discharge" name="Discharge (MW)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    <Line yAxisId="right" type="monotone" dataKey="soc" name="SoC (%)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Grid' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Grid Import vs Export</h3>
                  <p className="text-sm text-gray-500">Energy drawn from the grid versus surplus exported.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gridData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="import" name="Grid Import (MW)" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="export" name="Grid Export (MW)" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Tariff & Cost' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tariff Rates vs Energy Cost</h3>
                  <p className="text-sm text-gray-500">Visualizing how time-of-use tariffs affect energy cost.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={tariffCostData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar yAxisId="left" dataKey="cost" name="Energy Cost (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    <Line yAxisId="right" type="stepAfter" dataKey="tariff" name="Tariff (₹/kWh)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'EMS Savings' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Optimization Savings</h3>
                  <p className="text-sm text-gray-500">Historical performance of AI EMS cost reductions.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={savingsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="withoutEms" name="Baseline Cost (₹)" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="withEms" name="Optimized Cost (₹)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Line type="monotone" dataKey="savings" name="Savings (₹)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
