import React from 'react';
import Link from 'next/link';
import { mockData } from '@/data/mock';
import { Cloud, Sun, Wind, Thermometer, ArrowRight, HelpCircle } from 'lucide-react';

export function WeatherCard() {
  const { ghi, dni, temp, wind, cloud } = mockData.solarConditions;

  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Solar Conditions</h2>
        <div className="tooltip-trigger">
          <HelpCircle size={18} />
          <div className="tooltip-content">
            <strong>Answers:</strong> What are the current environmental conditions affecting solar yield?
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <Sun size={20} />
          </div>
          <div>
            <div className="text-xs text-secondary-text font-medium">GHI</div>
            <div className="text-lg font-bold text-primary-text">{ghi} <span className="text-xs font-medium text-secondary-text">W/m²</span></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <Sun size={20} />
          </div>
          <div>
            <div className="text-xs text-secondary-text font-medium">DNI</div>
            <div className="text-lg font-bold text-primary-text">{dni} <span className="text-xs font-medium text-secondary-text">W/m²</span></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg text-red-500">
            <Thermometer size={20} />
          </div>
          <div>
            <div className="text-xs text-secondary-text font-medium">Temperature</div>
            <div className="text-lg font-bold text-primary-text">{temp}°C</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
            <Wind size={20} />
          </div>
          <div>
            <div className="text-xs text-secondary-text font-medium">Wind</div>
            <div className="text-lg font-bold text-primary-text">{wind} <span className="text-xs font-medium text-secondary-text">m/s</span></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 col-span-2 mt-1">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
            <Cloud size={20} />
          </div>
          <div>
            <div className="text-xs text-secondary-text font-medium">Cloud Cover</div>
            <div className="text-lg font-bold text-primary-text">{cloud}%</div>
          </div>
        </div>
      </div>
      
      <Link href="/analytics" className="mt-6 btn-action">
        <Sun size={16} />
        Weather analysis
        <ArrowRight size={16} className="text-secondary-text ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}
