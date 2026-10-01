"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { HelpCircle, BarChart3 } from 'lucide-react';

const data = [
  { day: 'Mon', yield: 145, expected: 150 },
  { day: 'Tue', yield: 160, expected: 150 },
  { day: 'Wed', yield: 130, expected: 150 },
  { day: 'Thu', yield: 165, expected: 150 },
  { day: 'Fri', yield: 155, expected: 150 },
  { day: 'Sat', yield: 170, expected: 150 },
  { day: 'Sun', yield: 168, expected: 150 },
];

export function YieldBarChartCard() {
  return (
    <div className="solid-card p-6 flex flex-col h-full group min-h-[350px]">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
          <BarChart3 size={16} /> Weekly Yield
        </h2>
        <div className="tooltip-trigger">
          <HelpCircle size={18} />
          <div className="tooltip-content w-48">
            <strong>Answers:</strong> How much energy did we produce daily compared to expectations?
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 600 }}
              labelStyle={{ color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}
              cursor={{ fill: '#F3F4F6' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
            <Bar dataKey="yield" name="Actual (MWh)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="expected" name="Expected (MWh)" fill="#FBBF24" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
