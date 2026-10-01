"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { mockData } from '@/data/mock';
import { Settings2, ChevronDown, CalendarDays, X, Activity, Zap, ActivitySquare, AlertTriangle, Map } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function PlantStatusHeader() {
  const { status, invertersOnline, totalInverters, date, time } = mockData.plantStatus;
  const [isOpen, setIsOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'power' | 'efficiency' | 'voltage' | 'errors'>('power');
  const [currentDate, setCurrentDate] = useState(date);
  const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('daily');
  const [timeFormat, setTimeFormat] = useState<'24h' | '0-12h' | '12-24h'>('24h');

  // Mock historical data for daily view
  const historicalData = [
    { timeLabel: 'Mon', power: 14.2, efficiency: 81.2, voltage: 642, errors: 2 },
    { timeLabel: 'Tue', power: 15.6, efficiency: 83.5, voltage: 645, errors: 1 },
    { timeLabel: 'Wed', power: 11.4, efficiency: 79.8, voltage: 638, errors: 4 },
    { timeLabel: 'Thu', power: 18.2, efficiency: 85.1, voltage: 651, errors: 0 },
    { timeLabel: 'Fri', power: 16.5, efficiency: 84.0, voltage: 648, errors: 1 },
    { timeLabel: 'Sat', power: 13.9, efficiency: 82.3, voltage: 640, errors: 2 },
    { timeLabel: 'Sun', power: 17.8, efficiency: 84.6, voltage: 650, errors: 0 },
  ];

  // Generate hourly data
  const generateHourlyData = () => {
    return Array.from({ length: 24 }).map((_, i) => ({
      hour: i,
      timeLabel: `${i.toString().padStart(2, '0')}:00`,
      power: i > 5 && i < 19 ? 12 + Math.random() * 6 : Math.random() * 1.5,
      efficiency: i > 5 && i < 19 ? 80 + Math.random() * 10 : 0,
      voltage: 620 + Math.random() * 30,
      errors: Math.random() > 0.8 ? 1 : 0
    }));
  };

  const hourlyData = React.useMemo(() => generateHourlyData(), []);

  const getDisplayData = () => {
    if (viewMode === 'daily') return historicalData;
    
    // Hourly view logic
    if (timeFormat === '0-12h') return hourlyData.filter(d => d.hour < 12);
    if (timeFormat === '12-24h') return hourlyData.filter(d => d.hour >= 12);
    return hourlyData; // 24h
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between w-full mb-6 relative z-40">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">ENFLO SOLAR</h1>
        </div>
        <div className="flex items-center flex-wrap gap-4 text-sm font-medium text-secondary-text">
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border shadow-sm">
            <span className={`status-dot ${status === 'Operational' ? 'status-dot-healthy' : 'status-dot-warning'}`}></span>
            <span className="text-primary-text">Plant status: {status}</span>
          </div>
          <div className="bg-surface px-3 py-1.5 rounded-full border border-border shadow-sm">
            {invertersOnline}/{totalInverters} Inverters online
          </div>
          <Link href="/plant-map" className="inline-flex w-max items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent-dark hover:bg-accent/20 rounded-full text-sm font-bold border border-accent/20 transition-colors">
            <Map size={16} /> Switch Plant
          </Link>
          <button className="inline-flex w-max items-center gap-1.5 px-3 py-1.5 bg-surface text-secondary-text hover:text-primary-text hover:bg-gray-50 rounded-full text-sm font-bold border border-border transition-colors">
            <Settings2 size={16} /> Plant Settings
          </button>
        </div>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col text-right hover:bg-surface p-2 rounded-xl border transition-colors group cursor-pointer ${isOpen ? 'bg-surface border-border shadow-sm' : 'border-transparent hover:border-border'}`}
          >
            <div className="text-lg font-bold text-primary-text flex items-center gap-2 justify-end">
              {currentDate}
              <ChevronDown size={18} className={`text-secondary-text group-hover:text-accent-dark transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className="text-sm text-secondary-text font-medium text-accent-dark flex items-center justify-end gap-1">
              <CalendarDays size={14} /> Historical Trends
            </div>
          </button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-[450px] bg-surface border border-border rounded-2xl shadow-xl p-5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary-text">Historical Analysis</h3>
                <button onClick={() => setIsOpen(false)} className="text-secondary-text hover:text-primary-text">
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button onClick={() => setActiveMetric('power')} className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border ${activeMetric === 'power' ? 'bg-accent/10 border-accent/30 text-accent-dark' : 'border-border/50 text-secondary-text hover:bg-gray-50'}`}>
                  <Zap size={14} /> Power
                </button>
                <button onClick={() => setActiveMetric('efficiency')} className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border ${activeMetric === 'efficiency' ? 'bg-accent/10 border-accent/30 text-accent-dark' : 'border-border/50 text-secondary-text hover:bg-gray-50'}`}>
                  <Activity size={14} /> Efficiency
                </button>
                <button onClick={() => setActiveMetric('voltage')} className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border ${activeMetric === 'voltage' ? 'bg-accent/10 border-accent/30 text-accent-dark' : 'border-border/50 text-secondary-text hover:bg-gray-50'}`}>
                  <ActivitySquare size={14} /> Voltage
                </button>
                <button onClick={() => setActiveMetric('errors')} className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border ${activeMetric === 'errors' ? 'bg-danger/10 border-danger/30 text-danger' : 'border-border/50 text-secondary-text hover:bg-gray-50'}`}>
                  <AlertTriangle size={14} /> Errors
                </button>
              </div>
              
              {/* View Mode & Date Selection */}
              <div className="flex items-center justify-between mb-4 bg-gray-50/50 p-2 rounded-xl border border-border/50">
                <div className="flex gap-1">
                  <button 
                    onClick={() => setViewMode('daily')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'daily' ? 'bg-white shadow-sm text-primary-text border border-border' : 'text-secondary-text hover:text-primary-text'}`}
                  >
                    Daily Range
                  </button>
                  <button 
                    onClick={() => setViewMode('hourly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${viewMode === 'hourly' ? 'bg-white shadow-sm text-primary-text border border-border' : 'text-secondary-text hover:text-primary-text'}`}
                  >
                    Specific Date (Hourly)
                  </button>
                </div>
                
                {viewMode === 'hourly' && (
                  <select 
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white font-medium text-primary-text outline-none focus:border-accent cursor-pointer"
                    onChange={(e) => setTimeFormat(e.target.value as any)}
                    value={timeFormat}
                  >
                    <option value="24h">24 Hrs</option>
                    <option value="0-12h">0-12 Hrs (AM)</option>
                    <option value="12-24h">12-24 Hrs (PM)</option>
                  </select>
                )}
              </div>

              <div className="h-44 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDisplayData()} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', padding: '4px 8px', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={activeMetric} 
                      stroke={activeMetric === 'errors' ? '#EF4444' : '#3B82F6'} 
                      strokeWidth={3} 
                      dot={{ r: viewMode === 'hourly' ? 2 : 4, strokeWidth: 0, fill: activeMetric === 'errors' ? '#EF4444' : '#3B82F6' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center border-t border-border/50 pt-4">
                <div className="text-xs text-secondary-text">Data Selection:</div>
                <select 
                  className="text-xs border border-border rounded-md px-2 py-1 bg-gray-50 font-medium text-primary-text outline-none focus:border-accent cursor-pointer"
                  onChange={(e) => setCurrentDate(e.target.value)}
                  value={currentDate}
                >
                  {viewMode === 'hourly' ? (
                    <>
                      <option value="01 OCT 2026">01 OCT 2026 (Today)</option>
                      <option value="30 SEP 2026">30 SEP 2026 (Yesterday)</option>
                      <option value="29 SEP 2026">29 SEP 2026</option>
                    </>
                  ) : (
                    <>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 14 Days">Last 14 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        <button className="p-2.5 bg-surface border border-border rounded-xl shadow-sm hover:bg-accent/10 hover:border-accent hover:text-accent-dark transition-colors text-secondary-text cursor-pointer active:scale-95">
          <Settings2 size={20} />
        </button>
      </div>
    </div>
  );
}
