import React from 'react';
import Link from 'next/link';
import { mockData } from '@/data/mock';
import { Activity, ArrowRight, HelpCircle } from 'lucide-react';

export function PerformanceCard() {
  const { status, pr, epi, availability, soilingRatio } = mockData.performance;

  return (
    <div className="solid-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-bold text-secondary-text uppercase tracking-wider">Plant Performance</h2>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {status}
          </div>
          <div className="tooltip-trigger">
            <HelpCircle size={18} />
            <div className="tooltip-content">
              <strong>Answers:</strong> Is the solar plant performing well according to expected yields?
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-auto">
        <div>
          <div className="text-xs text-secondary-text font-medium mb-1 uppercase tracking-wide">PR</div>
          <div className="text-2xl font-bold text-primary-text">{pr}%</div>
        </div>
        <div>
          <div className="text-xs text-secondary-text font-medium mb-1 uppercase tracking-wide">EPI</div>
          <div className="text-2xl font-bold text-primary-text">{epi}%</div>
        </div>
        <div>
          <div className="text-xs text-secondary-text font-medium mb-1 uppercase tracking-wide">Availability</div>
          <div className="text-2xl font-bold text-primary-text">{availability}%</div>
        </div>
        <div>
          <div className="text-xs text-secondary-text font-medium mb-1 uppercase tracking-wide">Soiling Ratio</div>
          <div className="text-2xl font-bold text-primary-text">{soilingRatio}%</div>
        </div>
      </div>
      
      <Link href="/analytics" className="mt-6 btn-action">
        <Activity size={16} />
        Analyze performance
        <ArrowRight size={16} className="text-secondary-text ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}
