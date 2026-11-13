"use client";

import React from "react";
import { BarChart3, Battery, Sun, TrendingDown, TrendingUp } from "lucide-react";
import type { ScenarioMetric, ScenarioResult } from "@/lib/assistant/scenario";
import { cn } from "@/lib/utils";

function formatInr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`;
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(1)} L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

function formatMetric(value: number, unit: ScenarioMetric["unit"]): string {
  switch (unit) {
    case "INR/yr":
      return formatInr(value);
    case "panels":
      return value.toFixed(0);
    case "MW":
      return `${value.toFixed(2)} MW`;
    case "MWh":
      return `${value.toFixed(1)} MWh`;
    case "MWh/day":
      return `${value.toFixed(2)} MWh`;
    case "MWh/yr":
      return `${Math.round(value).toLocaleString("en-IN")} MWh`;
    default:
      return String(value);
  }
}

function deltaPct(metric: ScenarioMetric): number {
  if (!metric.baseline) return 0;
  return ((metric.projected - metric.baseline) / metric.baseline) * 100;
}

function isImprovement(metric: ScenarioMetric, delta: number): boolean {
  if (metric.goodDirection === "up") return delta >= 0;
  if (metric.goodDirection === "down") return delta <= 0;
  return true;
}

function MetricRow({ metric }: { metric: ScenarioMetric }) {
  const delta = metric.projected - metric.baseline;
  const change = deltaPct(metric);
  const improved = isImprovement(metric, delta);
  const max = Math.max(metric.baseline, metric.projected, 0.0001);
  const baselineWidth = Math.max(3, (metric.baseline / max) * 100);
  const projectedWidth = Math.max(3, (metric.projected / max) * 100);
  const barColor =
    metric.goodDirection === "neutral"
      ? "bg-indigo-500"
      : improved
        ? "bg-emerald-500"
        : "bg-rose-500";

  return (
    <div className="rounded-lg border border-border bg-white p-2">
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-secondary-text">
          {metric.label}
        </span>
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap",
            metric.goodDirection === "neutral"
              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
              : improved
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100",
          )}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-gray-300" style={{ width: `${baselineWidth}%` }} />
          </div>
          <span className="text-[9px] font-semibold text-gray-500 w-[62px] text-right tabular-nums">
            {formatMetric(metric.baseline, metric.unit)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div className={cn("h-full rounded-full", barColor)} style={{ width: `${projectedWidth}%` }} />
          </div>
          <span className="text-[9px] font-bold text-primary-text w-[62px] text-right tabular-nums">
            {formatMetric(metric.projected, metric.unit)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfitCurve({ scenario }: { scenario: ScenarioResult }) {
  const width = 248;
  const height = 76;
  const padX = 6;
  const padY = 10;
  const points = scenario.monthly;
  if (points.length < 2) return null;

  const maxValue = Math.max(...points.map((point) => Math.max(point.baseline, point.projected)), 1);
  const x = (index: number) => padX + (index / (points.length - 1)) * (width - padX * 2);
  const y = (value: number) => height - padY - (value / maxValue) * (height - padY * 2);

  const toPolyline = (key: "baseline" | "projected") =>
    points.map((point, index) => `${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`).join(" ");

  const negative = scenario.monthly[scenario.monthly.length - 1].projected < scenario.monthly[scenario.monthly.length - 1].baseline;
  const projectedColor = negative ? "#f43f5e" : "#10b981";
  const areaPoints = `${toPolyline("projected")} ${x(points.length - 1).toFixed(1)},${(height - padY).toFixed(1)} ${x(0).toFixed(1)},${(height - padY).toFixed(1)}`;

  return (
    <div className="rounded-lg border border-border bg-white p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1">
          <BarChart3 size={10} /> Cumulative profit
        </span>
        <div className="flex items-center gap-2 text-[8px] font-semibold text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-gray-400 inline-block" /> Baseline</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block" style={{ backgroundColor: projectedColor }} /> Scenario</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[64px]" role="img" aria-label="Cumulative annual profit projection">
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2 3" />
        <polygon points={areaPoints} fill={projectedColor} opacity="0.08" />
        <polyline points={toPolyline("baseline")} fill="none" stroke="#9ca3af" strokeWidth="1.75" strokeDasharray="3 3" strokeLinecap="round" />
        <polyline points={toPolyline("projected")} fill="none" stroke={projectedColor} strokeWidth="2.25" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-[8px] font-semibold text-gray-400 -mt-1 px-1">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
}

export function ScenarioChartCard({ scenario }: { scenario: ScenarioResult }) {
  const Icon = scenario.kind === "battery" ? Battery : Sun;
  const problem = scenario.deltaPercent < 0;

  return (
    <div className="w-full max-w-[88%] rounded-2xl rounded-tl-sm border border-border bg-gray-50 shadow-sm p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Icon size={13} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-primary-text leading-tight truncate">
              {scenario.title}
            </div>
            <div className="text-[9px] text-secondary-text leading-tight">
              Scenario projection
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0",
            problem
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-100",
          )}
        >
          {problem ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
          {scenario.deltaPercent > 0 ? "+" : ""}
          {scenario.deltaPercent.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {scenario.metrics.map((metric) => (
          <MetricRow key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-1.5">
        <ProfitCurve scenario={scenario} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-semibold bg-white border border-border text-gray-700 px-1.5 py-0.5 rounded">
          {scenario.capexLabel}: {formatInr(scenario.capex)}
        </span>
        {scenario.paybackYears !== null && (
          <span className="text-[9px] font-semibold bg-white border border-border text-gray-700 px-1.5 py-0.5 rounded">
            Payback: {scenario.paybackYears.toFixed(1)} yr
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[9px] leading-snug text-gray-500">{scenario.assumption}</p>
    </div>
  );
}
