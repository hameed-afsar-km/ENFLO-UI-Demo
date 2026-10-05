"use client";

import React, { useState } from 'react';
import { PlantStatusHeader } from "@/components/PlantStatusHeader";
import { FileText, Download, Filter, Calendar, CheckSquare } from 'lucide-react';

const mockReports = [
  { id: 1, title: 'Daily Yield & Economics Report', date: 'Oct 01, 2026', size: '1.2 MB', type: 'PDF' },
  { id: 2, title: 'AI Optimizer Savings Impact', date: 'Sep 30, 2026', size: '2.4 MB', type: 'PDF' },
  { id: 3, title: 'BESS Degradation & Health Summary', date: 'Sep 25, 2026', size: '850 KB', type: 'CSV' },
  { id: 4, title: 'Monthly Plant Performance (PR)', date: 'Sep 01, 2026', size: '3.1 MB', type: 'PDF' },
  { id: 5, title: 'Asset Maintenance Log', date: 'Aug 15, 2026', size: '4.5 MB', type: 'CSV' },
];

export default function ReportsPage() {
  const [selectedReports, setSelectedReports] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    alert(`Downloading ${selectedReports.length} report(s)...`);
    setSelectedReports([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PlantStatusHeader />
      
      <div className="solid-card p-8 min-h-[600px] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={24} className="text-emerald-500" />
              Document Center & Reports
            </h2>
            <p className="text-sm text-gray-500 mt-1">Generate, view, and download comprehensive plant reports.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              <Calendar size={16} /> Date Range
            </button>
            <button 
              onClick={handleDownload}
              disabled={selectedReports.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download size={16} /> Download Selected ({selectedReports.length})
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-x-auto custom-scrollbar shadow-sm">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 w-16">
                  <button onClick={() => setSelectedReports(mockReports.length === selectedReports.length ? [] : mockReports.map(r => r.id))} className="text-gray-400 hover:text-emerald-500 transition-colors">
                    <CheckSquare size={18} className={selectedReports.length === mockReports.length ? "text-emerald-500" : ""} />
                  </button>
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Generated</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Format</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleSelect(report.id)}>
                  <td className="p-4">
                    <CheckSquare size={18} className={selectedReports.includes(report.id) ? "text-emerald-500" : "text-gray-300"} />
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{report.title}</td>
                  <td className="p-4 text-sm text-gray-600">{report.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${report.type === 'PDF' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{report.size}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-block"
                      onClick={(e) => { e.stopPropagation(); alert(`Downloading ${report.title}`); }}
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
