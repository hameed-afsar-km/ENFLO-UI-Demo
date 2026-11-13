"use client";

import React, { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { mockData } from '@/data/mock';
import { ChevronDown, Thermometer, Zap, Sun, Activity, Gauge, HelpCircle, AlertTriangle } from 'lucide-react';

export function IndividualPanelCard() {
  const {
    selectedPlant,
    selectedPanel,
    setSelectedPanel,
    currentPlantPanels,
    plantPanelCount,
    selectedPanelData,
    activeSimulations,
  } = useSimulation();

  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');

  const plantPanelsData = currentPlantPanels.map((pId) => {
    const base = mockData.panels.find((p) => p.id === pId) || {
      id: pId, status: 'Normal', acKw: 225, dcKw: 236, eff: 95.2, temp: 42.0, energyMwh: 1.18, pr: 82.0,
    };
    const isError = activeSimulations.some((s) => s.panelId === pId && s.plantName === selectedPlant);
    return isError ? { ...base, status: 'Critical', acKw: 0, dcKw: 0, eff: 0, pr: 0 } : base;
  });

  const activePanel = selectedPanelData ||
    plantPanelsData.find((p) => p.id === selectedPanel) ||
    plantPanelsData[0] || {
      id: 'PNL-01', status: 'Normal', acKw: 225, dcKw: 236, eff: 95.3, temp: 42.1, energyMwh: 1.18, pr: 82.1,
    };

  const isCritical = activePanel.status === 'Critical';
  const isWarning = activePanel.status === 'Warning';

  const filtered = plantPanelsData.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status.toLowerCase() === filterStatus;
  });

  const counts = {
    normal: plantPanelsData.filter((p) => p.status === 'Normal').length,
    warning: plantPanelsData.filter((p) => p.status === 'Warning').length,
    critical: plantPanelsData.filter((p) => p.status === 'Critical').length,
  };

  const tempColor = activePanel.temp > 48 ? 'text-rose-600' : activePanel.temp > 44 ? 'text-amber-600' : 'text-gray-800';

  return (
    <div className="solid-card bg-white overflow-hidden">

      {/* ── HEADER ── */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Zap size={15} className="text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Panel Telemetry</span>
          <span className="text-xs text-gray-300 font-light">|</span>
          <span className="text-xs text-gray-500">{selectedPlant}</span>

          <div className="tooltip-trigger">
            <HelpCircle size={13} className="text-gray-300" />
            <div className="tooltip-content w-56">
              <strong className="block mb-1 text-white font-bold">Individual Panel Data</strong>
              Real-time per-panel telemetry. BESS is shared — 1 central battery buffers all {plantPanelCount} panels.
            </div>
          </div>
        </div>

        {/* Panel selector */}
        <div className="relative inline-flex items-center">
          <select
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            className="appearance-none bg-gray-50 hover:bg-blue-50 hover:border-blue-300 pl-3 pr-7 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 cursor-pointer outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          >
            {currentPlantPanels.map((pId) => (
              <option key={pId} value={pId}>{pId}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── SELECTED PANEL METRICS STRIP ── */}
      <div className={`px-5 py-4 ${isCritical ? 'bg-rose-50/60' : 'bg-gray-50/40'} border-b border-gray-100`}>
        {isCritical ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
            <AlertTriangle size={16} className="text-rose-500" />
            <span><strong>{activePanel.id}</strong> is offline — fault detected. No live data available.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {/* AC Power */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Zap size={9} className="text-amber-500" /> AC Power
              </span>
              <span className="text-lg font-black text-gray-900 leading-tight">
                {activePanel.acKw} <span className="text-xs font-semibold text-gray-400">kW</span>
              </span>
            </div>

            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* DC String */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Sun size={9} className="text-orange-500" /> DC Input
              </span>
              <span className="text-lg font-black text-gray-700 leading-tight">
                {activePanel.dcKw} <span className="text-xs font-semibold text-gray-400">kW</span>
              </span>
            </div>

            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* Inverter Efficiency */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge size={9} className="text-blue-500" /> Inv. Eff.
              </span>
              <span className="text-lg font-black text-blue-600 leading-tight">
                {activePanel.eff}<span className="text-xs font-semibold text-gray-400">%</span>
              </span>
            </div>

            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* Temp */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer size={9} className={activePanel.temp > 44 ? 'text-rose-500' : 'text-amber-500'} /> Module Temp
              </span>
              <span className={`text-lg font-black leading-tight ${tempColor}`}>
                {activePanel.temp}<span className="text-xs font-semibold text-gray-400">°C</span>
              </span>
            </div>

            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* Energy Today */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Activity size={9} className="text-emerald-500" /> Today
              </span>
              <span className="text-lg font-black text-emerald-600 leading-tight">
                {activePanel.energyMwh} <span className="text-xs font-semibold text-gray-400">MWh</span>
              </span>
            </div>

            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* PR */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">PR</span>
              <span className="text-lg font-black text-indigo-600 leading-tight">
                {activePanel.pr}<span className="text-xs font-semibold text-gray-400">%</span>
              </span>
            </div>

            {/* Status pill */}
            <div className="flex flex-col justify-end ml-auto">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 self-start ${
                isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {activePanel.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── PANEL LIST ── */}
      <div className="px-5 py-3">

        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {([
              { key: 'all', label: `All (${plantPanelCount})` },
              { key: 'normal', label: `Online (${counts.normal})` },
              ...(counts.warning > 0 ? [{ key: 'warning', label: `Warning (${counts.warning})` }] : []),
              ...(counts.critical > 0 ? [{ key: 'critical', label: `Offline (${counts.critical})` }] : []),
            ] as { key: typeof filterStatus; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  filterStatus === key
                    ? key === 'critical'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : key === 'warning'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-gray-400 hidden sm:block">Click row to inspect</span>
        </div>

        {/* Compact scrollable list */}
        <div className="overflow-y-auto max-h-[280px] rounded-xl border border-gray-100 divide-y divide-gray-50">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_60px_60px_56px_52px_52px_52px] gap-2 px-3 py-2 bg-gray-50 sticky top-0 z-10">
            {['Panel', 'AC kW', 'DC kW', 'Eff %', 'Temp', 'MWh', 'PR %'].map((h) => (
              <span key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((panel) => {
            const isSel = panel.id === selectedPanel;
            const isCrit = panel.status === 'Critical';
            const isWarn = panel.status === 'Warning';

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setSelectedPanel(panel.id)}
                className={`w-full grid grid-cols-[1fr_60px_60px_56px_52px_52px_52px] gap-2 px-3 py-2.5 text-left transition-all cursor-pointer ${
                  isSel
                    ? 'bg-blue-50'
                    : isCrit
                    ? 'bg-rose-50/60 hover:bg-rose-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Panel ID + status dot */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isCrit ? 'bg-rose-500 animate-pulse' : isWarn ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`text-xs font-bold truncate ${
                    isSel ? 'text-blue-700' : isCrit ? 'text-rose-700' : 'text-gray-800'
                  }`}>
                    {panel.id}
                  </span>
                  {isSel && (
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full shrink-0">
                      active
                    </span>
                  )}
                </div>

                {/* AC kW */}
                <span className={`text-xs font-bold tabular-nums ${isCrit ? 'text-rose-400' : 'text-gray-800'}`}>
                  {isCrit ? '—' : panel.acKw}
                </span>

                {/* DC kW */}
                <span className={`text-xs font-semibold tabular-nums text-gray-500`}>
                  {isCrit ? '—' : panel.dcKw}
                </span>

                {/* Efficiency */}
                <span className={`text-xs font-bold tabular-nums ${
                  isCrit ? 'text-rose-400' : panel.eff >= 90 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {isCrit ? '—' : `${panel.eff}%`}
                </span>

                {/* Temp */}
                <span className={`text-xs font-semibold tabular-nums ${
                  isCrit ? 'text-gray-300' : panel.temp > 46 ? 'text-rose-500' : 'text-gray-600'
                }`}>
                  {isCrit ? '—' : `${panel.temp}°`}
                </span>

                {/* Energy MWh */}
                <span className={`text-xs font-semibold tabular-nums ${isCrit ? 'text-gray-300' : 'text-emerald-600'}`}>
                  {isCrit ? '—' : panel.energyMwh}
                </span>

                {/* PR */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold tabular-nums ${
                    isCrit ? 'text-gray-300' : panel.pr >= 80 ? 'text-indigo-600' : 'text-amber-600'
                  }`}>
                    {isCrit ? '—' : `${panel.pr}`}
                  </span>
                  {!isCrit && (
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden min-w-[18px]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${panel.pr}%`,
                          backgroundColor: panel.pr >= 80 ? '#6366f1' : '#f59e0b',
                        }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
              No panels match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
