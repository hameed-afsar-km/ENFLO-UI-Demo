"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HelpCircle, PieChart as PieChartIcon } from 'lucide-react';

const data = [
  { name: 'Factory Load', value: 65, color: '#3B82F6' },
  { name: 'Battery Storage', value: 20, color: '#10B981' },
  { name: 'Grid Export', value: 15, color: '#F59E0B' },
];

export function DistributionPieChartCard() {
  return (
    <div className="solid-card p-6 flex flex-col h-full group min-h-[350px]">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
          <PieChartIcon size={16} /> Energy Destination
        </h2>
        <div className="tooltip-trigger">
          <HelpCircle size={18} />
          <div className="tooltip-content w-48">
            <strong>Answers:</strong> Where is the produced energy being consumed?
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[200px] relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center mt-[-10px]">
            <div className="text-sm font-bold text-secondary-text">Total</div>
            <div className="text-2xl font-black text-primary-text">100%</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 600, color: '#1F2937' }}
              formatter={(value) => [`${value}%`, undefined]}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
