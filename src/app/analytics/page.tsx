"use client";

import React, { useState } from 'react';
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for analytics
const performanceData = [
  { month: 'Jan', pr: 82.1, expected: 80 },
  { month: 'Feb', pr: 81.5, expected: 80 },
  { month: 'Mar', pr: 83.2, expected: 80 },
  { month: 'Apr', pr: 84.1, expected: 80 },
  { month: 'May', pr: 82.8, expected: 80 },
  { month: 'Jun', pr: 80.5, expected: 80 },
];

const availabilityData = [
  { week: 'W1', panel: 99.1, grid: 100 },
  { week: 'W2', panel: 98.5, grid: 99.8 },
  { week: 'W3', panel: 99.9, grid: 100 },
  { week: 'W4', panel: 97.2, grid: 100 },
];

const soilingData = [
  { week: 'W1', ratio: 2.1 },
  { week: 'W2', ratio: 3.4 },
  { week: 'W3', ratio: 4.8 },
  { week: 'W4', ratio: 1.2 }, // After cleaning
];

const degradationData = [
  { year: 'Y1', eff: 99.5 },
  { year: 'Y2', eff: 98.2 },
  { year: 'Y3', eff: 97.4 },
  { year: 'Y4', eff: 96.8 },
];

const capacityData = [
  { region: 'North', installed: 5.2, active: 5.0 },
  { region: 'South', installed: 4.8, active: 4.5 },
  { region: 'East', installed: 3.5, active: 3.5 },
];

const maintenanceData = [
  { month: 'Jan', hours: 12 },
  { month: 'Feb', hours: 8 },
  { month: 'Mar', hours: 24 },
  { month: 'Apr', hours: 10 },
];

const failureData = [
  { name: 'Panel', value: 45 },
  { name: 'Tracker', value: 30 },
  { name: 'Comms', value: 15 },
  { name: 'Other', value: 10 },
];

import { Search } from 'lucide-react';

export default function AnalyticsPage() {
  const tabs = ['Performance', 'Availability', 'Soiling', 'Degradation', 'Capacity', 'Maintenance', 'Failures'];
  const [activeTab, setActiveTab] = useState('Performance');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-6 min-h-[600px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-primary-text mb-4 sm:mb-2">Deep Analytics</h2>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab 
                    ? 'bg-accent/10 text-accent-dark border border-accent/20 shadow-sm' 
                    : 'bg-surface text-secondary-text border border-transparent hover:bg-gray-50 hover:text-primary-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative group w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text group-focus-within:text-accent-dark transition-colors" />
            <input 
              type="text" 
              placeholder="Search metrics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg bg-surface/80 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all placeholder-secondary-text/70"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {activeTab === 'Performance' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Performance Ratio (PR) Trends</h3>
                  <p className="text-sm text-secondary-text">Actual vs Expected Performance Ratio over the last 6 months.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis domain={[70, 90]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="pr" name="Actual PR (%)" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorPr)" />
                    <Line type="step" dataKey="expected" name="Expected PR (%)" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Availability' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Plant Availability</h3>
                  <p className="text-sm text-secondary-text">Panel and Grid availability breakdown.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={availabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="panel" name="Panel Availability (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="grid" name="Grid Availability (%)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Soiling' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Soiling Loss Ratio</h3>
                  <p className="text-sm text-secondary-text">Impact of dust/dirt on generation before and after cleaning events.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={soilingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="ratio" name="Soiling Loss (%)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Degradation' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Year-over-Year Degradation</h3>
                  <p className="text-sm text-secondary-text">Long term panel efficiency tracking.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={degradationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="eff" name="Relative Efficiency (%)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Capacity' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Active Capacity Breakdown</h3>
                  <p className="text-sm text-secondary-text">Installed vs Currently active MW capacity per region.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="installed" name="Installed (MW)" fill="#9CA3AF" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="active" name="Active (MW)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Maintenance' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Maintenance Labor Hours</h3>
                  <p className="text-sm text-secondary-text">Total hours spent on preventive and corrective maintenance.</p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="hours" name="Labor Hours" fill="#EC4899" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Failures' && (
            <div className="animate-in fade-in h-full flex flex-col items-center">
              <div className="flex justify-between items-center mb-6 w-full">
                <div>
                  <h3 className="text-lg font-bold text-primary-text">Failure Modes Distribution</h3>
                  <p className="text-sm text-secondary-text">Categorization of recorded faults across all subsystems.</p>
                </div>
              </div>
              <div className="h-80 w-full max-w-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failureData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="value" name="Incidents" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
