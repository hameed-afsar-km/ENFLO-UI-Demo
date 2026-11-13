"use client";

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Battery, 
  Sun, 
  Zap, 
  Info, 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  IndianRupee, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useSimulation, calculateDynamicTariff } from '@/context/SimulationContext';
import Link from 'next/link';

interface ScenarioChat {
  question: string;
  answer: string;
  appliedParams: {
    batteryMwh: number;
    solarMw: number;
    loadMw: number;
  };
  metrics: {
    annualSavings: number;
    investment: number;
    roiYears: string;
    selfConsumption: number;
  };
}

export default function WhatIfPage() {
  const { emsState } = useSimulation();
  
  const [batteryMwh, setBatteryMwh] = useState(emsState?.battery?.ratedCapacityMwh || 2.0);
  const [solarMw, setSolarMw] = useState(2.5); // base plant size (MW)
  const [loadMw, setLoadMw] = useState(2.0); // base load (MW)
  
  // Natural Language Input State
  const [promptInput, setPromptInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ScenarioChat[]>([
    {
      question: "Initial Baseline Setup",
      answer: "Current plant configuration: 2.0 MWh BESS battery capacity, 2.5 MW peak solar generation, and 2.0 MW factory load. Type any scenario question above or adjust sliders to simulate capacity changes and calculate projected ROI.",
      appliedParams: { batteryMwh: 2.0, solarMw: 2.5, loadMw: 2.0 },
      metrics: { annualSavings: 42.8, investment: 15.0, roiYears: "3.5", selfConsumption: 77.5 }
    }
  ]);

  // Derived financial & technical simulation results
  const results = useMemo(() => {
    const peakGridTariff = 9.80; // peak tariff at zero solar
    const dynamicSolarTariff = calculateDynamicTariff(solarMw);
    const tariffSpread = Math.max(1.5, peakGridTariff - dynamicSolarTariff);
    
    // Absolute capital investment: Solar at 4 Cr/MW, BESS at 2.5 Cr/MWh
    const costSolar = solarMw * 40000000;
    const costBattery = batteryMwh * 25000000;
    const totalInvestment = costSolar + costBattery;
    
    // Absolute annual savings based on self-consumption and peak tariff avoidance
    const annualSavings = ((solarMw * 4 * 330) * peakGridTariff * 1000) + (batteryMwh * 330 * tariffSpread * 1000);
    const roiYears = totalInvestment > 0 && annualSavings > 0 ? (totalInvestment / annualSavings).toFixed(1) : 'N/A';
    
    // 24-hour simulation curve
    const chartData = [
      { time: '00:00', original: loadMw * 1000, projected: Math.max(0, loadMw * 1000 - batteryMwh * 100) },
      { time: '04:00', original: loadMw * 1050, projected: Math.max(0, loadMw * 1050 - (batteryMwh * 100 + solarMw * 10)) },
      { time: '08:00', original: loadMw * 1500, projected: Math.max(0, loadMw * 1500 - (batteryMwh * 200 + solarMw * 300)) },
      { time: '12:00', original: 0, projected: 0 },
      { time: '16:00', original: loadMw * 1800, projected: Math.max(0, loadMw * 1800 - (batteryMwh * 300 + solarMw * 200)) },
      { time: '20:00', original: loadMw * 2200, projected: Math.max(0, loadMw * 2200 - (batteryMwh * 500 + solarMw * 50)) },
      { time: '23:59', original: loadMw * 1200, projected: Math.max(0, loadMw * 1200 - batteryMwh * 150) },
    ];
    
    const selfConsumptionBoost = Math.max(0, Math.min(100, 60 + (batteryMwh * 5) + (solarMw * 3)));
    const gridDependenceDrop = Math.max(0, Math.min(100, 10 + (batteryMwh * 6) + (solarMw * 5)));
    const co2Reduction = (solarMw * 800) + (batteryMwh * 150);

    return {
      annualSavings,
      totalInvestment,
      costSolar,
      costBattery,
      roiYears,
      chartData,
      selfConsumptionBoost,
      gridDependenceDrop,
      co2Reduction,
      dynamicSolarTariff
    };
  }, [batteryMwh, solarMw, loadMw]);

  // Natural Language Scenario Parser & Engine
  const handleAskScenario = (overridePrompt?: string) => {
    const query = (overridePrompt || promptInput).trim();
    if (!query) return;

    setIsProcessing(true);

    const p = query.toLowerCase();
    let newBattery = batteryMwh;
    let newSolar = solarMw;
    let newLoad = loadMw;

    // 1. Battery extraction
    const batteryMatch = p.match(/(?:battery|bess|storage)[^\d]*(\d+(?:\.\d+)?)\s*(?:mwh|mw)?/i)
                      || p.match(/(\d+(?:\.\d+)?)\s*(?:mwh)\s*(?:battery|bess|storage)?/i);
    if (batteryMatch) {
      newBattery = parseFloat(batteryMatch[1]);
    } else if (p.includes("double battery") || p.includes("double the battery")) {
      newBattery = Math.min(20, batteryMwh * 2);
    } else if (p.includes("triple battery")) {
      newBattery = Math.min(20, batteryMwh * 3);
    } else if (p.includes("add 4 mwh") || p.includes("add 4mwh")) {
      newBattery = batteryMwh + 4;
    } else if (p.includes("add 2 mwh") || p.includes("add 2mwh")) {
      newBattery = batteryMwh + 2;
    }

    // 2. Solar extraction
    const solarMatch = p.match(/(?:solar|pv|panels?|generation)[^\d]*(\d+(?:\.\d+)?)\s*(?:mw|mwh)?/i)
                    || p.match(/(\d+(?:\.\d+)?)\s*(?:mw)\s*(?:solar|pv|panels?)?/i);
    if (solarMatch) {
      newSolar = parseFloat(solarMatch[1]);
    } else if (p.includes("double solar") || p.includes("double the solar")) {
      newSolar = Math.min(15, solarMw * 2);
    } else if (p.includes("half solar") || p.includes("solar drops by 50%") || p.includes("cloudy")) {
      newSolar = Math.max(0.5, solarMw * 0.5);
    } else if (p.includes("add 5 mw solar") || p.includes("expand solar to 5 mw")) {
      newSolar = 5.0;
    }

    // 3. Load extraction
    const loadMatch = p.match(/(?:load|demand|factory|consumption)[^\d]*(\d+(?:\.\d+)?)\s*(?:mw)?/i)
                   || p.match(/(\d+(?:\.\d+)?)\s*(?:mw)\s*(?:load|demand|factory)/i);
    if (loadMatch) {
      newLoad = parseFloat(loadMatch[1]);
    } else if (p.includes("high load") || p.includes("spikes to 3.5 mw") || p.includes("spike")) {
      newLoad = 3.5;
    } else if (p.includes("low load") || p.includes("light demand")) {
      newLoad = 1.0;
    }

    // 4. Goal-oriented prompts
    if (p.includes("90% self-consumption") || p.includes("90% self consumption")) {
      newBattery = 6.0;
      newSolar = 4.5;
      newLoad = 2.0;
    } else if (p.includes("zero-grid") || p.includes("off-grid")) {
      newBattery = 10.0;
      newSolar = 6.0;
      newLoad = 2.0;
    } else if (p.includes("best roi") || p.includes("quickest payback")) {
      newBattery = 3.0;
      newSolar = 3.5;
      newLoad = 2.0;
    }

    // Clamp boundaries
    newBattery = Number(Math.min(20, Math.max(0, newBattery)).toFixed(1));
    newSolar = Number(Math.min(15, Math.max(0.5, newSolar)).toFixed(1));
    newLoad = Number(Math.min(10, Math.max(0.5, newLoad)).toFixed(1));

    // Update simulation parameters
    setBatteryMwh(newBattery);
    setSolarMw(newSolar);
    setLoadMw(newLoad);

    // Compute metrics for response
    const peakTariff = 9.80;
    const dynTariff = calculateDynamicTariff(newSolar);
    const spread = Math.max(1.5, peakTariff - dynTariff);
    const totalInv = (newSolar * 40000000) + (newBattery * 25000000);
    const annSavings = ((newSolar * 4 * 330) * peakTariff * 1000) + (newBattery * 330 * spread * 1000);
    const paybackYears = (totalInv / annSavings).toFixed(1);
    const selfCons = Math.min(100, Math.round(60 + (newBattery * 5) + (newSolar * 3)));
    const peakReduction = Math.min(newLoad, (newBattery * 0.4)).toFixed(1);

    // Generate grounded contextual explanation
    let answerText = "";
    if (p.includes("double battery")) {
      answerText = `Doubling battery capacity to ${newBattery} MWh significantly increases evening peak tariff arbitrage. It cuts peak grid import demand by ${peakReduction} MW, boosting self-consumption to ${selfCons}%. Projected annual energy savings rise to ₹${(annSavings / 100000).toFixed(2)} Lakhs with an estimated capital payback of ${paybackYears} years.`;
    } else if (p.includes("cloudy") || p.includes("drops by 50%")) {
      answerText = `Under a 50% solar reduction (${newSolar} MW generation), the dynamic grid tariff rises to ₹${dynTariff.toFixed(2)}/kWh due to reduced daytime solar supply. Your ${newBattery} MWh battery must reserve energy to cover factory load, leading to a baseline self-consumption of ${selfCons}%.`;
    } else if (p.includes("load") || p.includes("spike")) {
      answerText = `Simulating factory load at ${newLoad} MW: With ${newSolar} MW solar and ${newBattery} MWh BESS, the system covers daytime baseline demand, but peak evening hours will draw supplemental grid power. Estimated annual savings are ₹${(annSavings / 100000).toFixed(2)} Lakhs, maintaining a ${paybackYears}-year ROI payback.`;
    } else {
      answerText = `Configured scenario: ${newBattery} MWh BESS capacity with ${newSolar} MW solar PV under a ${newLoad} MW factory load. This configuration achieves ${selfCons}% self-consumption, generating ₹${(annSavings / 100000).toFixed(2)} Lakhs in annual savings against an investment of ₹${(totalInv / 10000000).toFixed(2)} Cr, breaking even in approximately ${paybackYears} years.`;
    }

    const newChat: ScenarioChat = {
      question: query,
      answer: answerText,
      appliedParams: {
        batteryMwh: newBattery,
        solarMw: newSolar,
        loadMw: newLoad
      },
      metrics: {
        annualSavings: Number((annSavings / 100000).toFixed(1)),
        investment: Number((totalInv / 10000000).toFixed(2)),
        roiYears: paybackYears,
        selfConsumption: selfCons
      }
    };

    setChatHistory(prev => [newChat, ...prev]);
    setPromptInput("");
    setIsProcessing(false);
  };

  const handleReset = () => {
    setBatteryMwh(emsState?.battery?.ratedCapacityMwh || 2.0);
    setSolarMw(2.5);
    setLoadMw(2.0);
  };

  const latestChat = chatHistory[0];

  return (
    <div className="min-h-screen bg-surface pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text hover:text-accent-dark transition-colors mb-1.5">
              <ArrowLeft size={14} /> Back to Fleet Dashboard
            </Link>
            <h1 className="text-3xl font-black text-primary-text tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-indigo-600" size={28} />
              AI Scenario What-If Simulator
            </h1>
            <p className="text-secondary-text mt-0.5 text-sm">
              Type natural-language scenario questions or tweak sliders. The AI immediately simulates, calculates ROI, and visualizes the updated power curves.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleReset} 
              className="flex items-center gap-1.5 bg-white border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <RefreshCw size={14} /> Reset
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* 1. HERO AI TEXT BOX COMPONENT */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/80 p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Bot size={18} />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  What-If AI Assistant
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    Natural Language Simulator
                  </span>
                </h2>
                <p className="text-xs text-gray-500">Ask any scenario question — AI sets parameters, answers your query, and visualizes the changes below.</p>
              </div>
            </div>

            <div className="tooltip-trigger">
              <HelpCircle size={16} />
              <div className="tooltip-content w-72">
                <strong className="block mb-1 text-white font-bold">How to use What-If AI:</strong>
                Type questions like:
                <div className="mt-1 space-y-0.5 text-[11px] text-gray-300">
                  <div>• &quot;What if we add 4 MWh battery and 5 MW solar?&quot;</div>
                  <div>• &quot;Double the battery capacity&quot;</div>
                  <div>• &quot;What if factory load spikes to 3.5 MW?&quot;</div>
                  <div>• &quot;How to achieve 90% self-consumption?&quot;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAskScenario(); }} 
            className="flex flex-col sm:flex-row gap-2.5 mb-3"
          >
            <div className="relative flex-1">
              <input 
                type="text" 
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask what-if, e.g. 'What if we add 4 MWh battery and solar is 4.5 MW?' or 'Double battery capacity'..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-gray-800 placeholder-gray-400 bg-gray-50/50"
              />
              {promptInput && (
                <button 
                  type="button" 
                  onClick={() => setPromptInput("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isProcessing || !promptInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
            >
              <Sparkles size={16} />
              <span>Simulate &amp; Ask</span>
            </button>
          </form>

          {/* Suggested Quick Question Chips */}
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb size={12} className="text-amber-500" /> Suggestions:
            </span>
            {[
              "Add 4 MWh BESS + 5 MW Solar",
              "Double battery capacity",
              "What if load spikes to 3.5 MW?",
              "Cloudy day: Solar drops by 50%",
              "Target 90% self-consumption",
              "Best ROI setup"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskScenario(chip)}
                className="text-[11px] font-semibold bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* AI Response Card */}
          {latestChat && (
            <div className="mt-4 bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    AI
                  </span>
                  <div className="text-xs font-bold text-indigo-950">
                    {latestChat.question === "Initial Baseline Setup" ? "Current Plant Baseline" : `Query: "${latestChat.question}"`}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={13} />
                  <span>Visualized on Charts Below</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed font-medium mb-3">
                {latestChat.answer}
              </p>

              {/* Active Applied Parameter Badges */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-semibold pt-2 border-t border-indigo-100">
                <span className="text-gray-500 text-[11px]">Applied to Simulator:</span>
                <span className="bg-white border border-blue-200 text-blue-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Battery size={13} className="text-blue-600" /> BESS: {batteryMwh.toFixed(1)} MWh
                </span>
                <span className="bg-white border border-orange-200 text-orange-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Sun size={13} className="text-orange-500" /> Solar PV: {solarMw.toFixed(1)} MW
                </span>
                <span className="bg-white border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Zap size={13} className="text-emerald-600" /> Factory Load: {loadMw.toFixed(1)} MW
                </span>
                <span className="bg-white border border-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md text-[11px]">
                  Grid Tariff: ₹{results.dynamicSolarTariff.toFixed(2)}/kWh
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. MAIN SIMULATION DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sliders & Parameter Modifiers */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wrench size={18} className="text-gray-400"/> Manual Sliders
                </h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Synced with AI
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Battery Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-0.5">
                        <Battery size={16} className="text-blue-500"/> Battery Capacity (BESS)
                      </div>
                      <div className="text-xs text-gray-500">Rated energy storage</div>
                    </div>
                    <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded-lg font-bold text-sm">
                      {batteryMwh.toFixed(1)} MWh
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    step="0.5" 
                    value={batteryMwh} 
                    onChange={(e) => setBatteryMwh(Number(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                    <span>0 MWh</span><span>10 MWh</span><span>20 MWh</span>
                  </div>
                </div>
                
                {/* Solar Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-0.5">
                        <Sun size={16} className="text-orange-500"/> Solar PV Capacity
                      </div>
                      <div className="text-xs text-gray-500">Installed peak generation</div>
                    </div>
                    <span className="bg-orange-50 border border-orange-100 text-orange-700 px-2.5 py-0.5 rounded-lg font-bold text-sm">
                      {solarMw.toFixed(1)} MW
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="15" 
                    step="0.5" 
                    value={solarMw} 
                    onChange={(e) => setSolarMw(Number(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                    <span>0.5 MW</span><span>7.5 MW</span><span>15 MW</span>
                  </div>
                </div>
                
                {/* Factory Load Slider */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-0.5">
                        <Zap size={16} className="text-emerald-500"/> Factory Load Demand
                      </div>
                      <div className="text-xs text-gray-500">Average plant consumption</div>
                    </div>
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-lg font-bold text-sm">
                      {loadMw.toFixed(1)} MW
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="10" 
                    step="0.1" 
                    value={loadMw} 
                    onChange={(e) => setLoadMw(Number(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                    <span>0.5 MW</span><span>5.0 MW</span><span>10 MW</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Executive Summary Card */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} className="text-indigo-600" /> Projected Impact Summary
              </h3>
              <p className="text-indigo-950 text-xs sm:text-sm leading-relaxed mb-4">
                This configuration provides <strong>{results.selfConsumptionBoost.toFixed(0)}%</strong> clean self-consumption and cuts peak tariff grid import reliance by <strong>{results.gridDependenceDrop.toFixed(0)}%</strong>.
              </p>
              
              <div className="bg-white rounded-xl p-3.5 border border-indigo-100 shadow-xs">
                <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-600" /> Additional Annual Savings
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{(results.annualSavings / 100000).toFixed(2)} <span className="text-xs text-emerald-600/80 font-bold">Lakhs / yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & ROI Metrics */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-center">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <IndianRupee size={14} className="text-gray-400" /> Projected Investment
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  ₹{(results.totalInvestment / 10000000).toFixed(2)}<span className="text-sm text-gray-500 font-bold ml-1">Cr</span>
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-1">
                  Solar: ₹{(results.costSolar / 10000000).toFixed(1)}Cr · BESS: ₹{(results.costBattery / 10000000).toFixed(1)}Cr
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-center">
                <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> Estimated Payback
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {results.roiYears}<span className="text-sm text-emerald-600/80 font-bold ml-1">Years</span>
                </div>
                <div className="text-[11px] text-emerald-600/70 font-medium mt-1">
                  Breakeven by {new Date().getFullYear() + Math.ceil(parseFloat(results.roiYears) || 0)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-center">
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sun size={14} /> Carbon Offset
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600">
                  {results.co2Reduction.toFixed(0)}<span className="text-sm text-blue-600/80 font-bold ml-1">Tons</span>
                </div>
                <div className="text-[11px] text-blue-500 font-medium mt-1">
                  CO₂ avoided annually
                </div>
              </div>
            </div>

            {/* 24-Hour Peak Grid Import Cost Simulation Chart */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-0.5">24-Hour Peak Grid Import Cost Curve</h2>
                  <p className="text-xs text-gray-500">Visualizes peak cost flattening when solar + BESS dispatch covers daytime and evening peaks.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Live Simulation
                </span>
              </div>
              
              <div className="flex-1 w-full min-h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#d1d5db" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                      labelStyle={{ color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}
                      formatter={(value: any) => [`₹${Number(value).toFixed(0)}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 600 }} />
                    <Area type="monotone" name="Baseline Grid Import Cost (₹)" dataKey="original" stroke="#9ca3af" fill="url(#colorOriginal)" strokeDasharray="4 4" strokeWidth={2} />
                    <Area type="monotone" name="Projected Cost with EMS (₹)" dataKey="projected" stroke="#10b981" fill="url(#colorProjected)" strokeWidth={3.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Wrench({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  );
}