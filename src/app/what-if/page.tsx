"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Lightbulb,
  MessageSquare,
  ExternalLink,
  Trash2,
  Sliders
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useSimulation, calculateDynamicTariff } from '@/context/SimulationContext';
import Link from 'next/link';

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  appliedParams?: {
    batteryMwh: number;
    solarMw: number;
    loadMw: number;
    dynamicTariff: number;
  };
  metrics?: {
    annualSavingsLakhs: number;
    investmentCr: number;
    roiYears: string;
    selfConsumption: number;
  };
}

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: "init-1",
    role: "assistant",
    content: "Welcome to the ENERCO What-If AI Copilot! Ask any scenario question (e.g. 'What if we add 4 MWh BESS and 5 MW solar?', 'Double battery capacity', or 'What if factory load spikes to 3.5 MW?'). I will analyze the economic and electrical trade-offs, update the sliders, and simulate the 24-hour cost curve in real time.",
    timestamp: "Just now",
    appliedParams: {
      batteryMwh: 2.0,
      solarMw: 2.5,
      loadMw: 2.0,
      dynamicTariff: 3.80
    },
    metrics: {
      annualSavingsLakhs: 42.8,
      investmentCr: 15.0,
      roiYears: "3.5",
      selfConsumption: 78
    }
  }
];

export default function WhatIfPage() {
  const { emsState, openAssistant, selectedPlant } = useSimulation();
  
  // Baseline parameters
  const [batteryMwh, setBatteryMwh] = useState(2.0);
  const [solarMw, setSolarMw] = useState(2.5); // base plant size (MW)
  const [loadMw, setLoadMw] = useState(2.0); // base load (MW)
  
  // Chat Interface State
  const [promptInput, setPromptInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing]);

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

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message immediately
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: timeStr
    };

    setChatMessages(prev => [...prev, userMsg]);
    setPromptInput("");
    setIsProcessing(true);

    // Simulate smart agent processing
    setTimeout(() => {
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
      } else if (p.includes("best roi") || p.includes("quickest payback") || p.includes("optimal roi")) {
        newBattery = 3.0;
        newSolar = 3.5;
        newLoad = 2.0;
      }

      // Clamp boundaries
      newBattery = Number(Math.min(20, Math.max(0, newBattery)).toFixed(1));
      newSolar = Number(Math.min(15, Math.max(0.5, newSolar)).toFixed(1));
      newLoad = Number(Math.min(10, Math.max(0.5, newLoad)).toFixed(1));

      // Update simulation parameters (synchronizing sliders & charts)
      setBatteryMwh(newBattery);
      setSolarMw(newSolar);
      setLoadMw(newLoad);

      // Compute metrics for response
      const peakTariff = 9.80;
      const dynTariff = calculateDynamicTariff(newSolar);
      const spread = Math.max(1.5, peakTariff - dynTariff);
      const totalInv = (newSolar * 40000000) + (newBattery * 25000000);
      const annSavings = ((newSolar * 4 * 330) * peakTariff * 1000) + (newBattery * 330 * spread * 1000);
      const paybackYears = totalInv > 0 && annSavings > 0 ? (totalInv / annSavings).toFixed(1) : 'N/A';
      const selfCons = Math.min(100, Math.round(60 + (newBattery * 5) + (newSolar * 3)));
      const peakReduction = Math.min(newLoad, (newBattery * 0.4)).toFixed(1);

      // Generate grounded contextual explanation
      let answerText = "";
      if (p.includes("double battery")) {
        answerText = `Doubling battery capacity to ${newBattery} MWh significantly expands evening peak tariff arbitrage. It cuts peak grid import demand by ${peakReduction} MW, boosting self-consumption to ${selfCons}%. Projected annual energy savings rise to ₹${(annSavings / 100000).toFixed(2)} Lakhs with an estimated capital payback of ${paybackYears} years.`;
      } else if (p.includes("cloudy") || p.includes("drops by 50%")) {
        answerText = `Under a 50% solar reduction (${newSolar} MW generation), the dynamic grid tariff rises to ₹${dynTariff.toFixed(2)}/kWh due to reduced daytime solar supply. Your ${newBattery} MWh BESS must buffer factory load, leading to a baseline self-consumption of ${selfCons}%.`;
      } else if (p.includes("load") || p.includes("spike")) {
        answerText = `Simulating factory load at ${newLoad} MW: With ${newSolar} MW solar and ${newBattery} MWh BESS, the system covers daytime baseline demand, but peak evening hours will draw supplemental grid power. Estimated annual savings are ₹${(annSavings / 100000).toFixed(2)} Lakhs, maintaining a ${paybackYears}-year ROI payback.`;
      } else if (p.includes("why is grid tariff dynamic") || p.includes("tariff")) {
        answerText = `Grid tariffs are dynamic because high solar generation (e.g. ${newSolar} MW) supplies abundant low-marginal-cost electricity to the grid, dropping wholesale rates to ₹${dynTariff.toFixed(2)}/kWh. When solar drops, expensive peaker generation ramps up, elevating rates up to ₹9.80/kWh.`;
      } else {
        answerText = `Configured scenario: ${newBattery} MWh BESS capacity with ${newSolar} MW solar PV under a ${newLoad} MW factory load. This configuration achieves ${selfCons}% self-consumption, generating ₹${(annSavings / 100000).toFixed(2)} Lakhs in annual savings against an investment of ₹${(totalInv / 10000000).toFixed(2)} Cr, breaking even in approximately ${paybackYears} years.`;
      }

      const assistantMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appliedParams: {
          batteryMwh: newBattery,
          solarMw: newSolar,
          loadMw: newLoad,
          dynamicTariff: dynTariff
        },
        metrics: {
          annualSavingsLakhs: Number((annSavings / 100000).toFixed(1)),
          investmentCr: Number((totalInv / 10000000).toFixed(2)),
          roiYears: paybackYears,
          selfConsumption: selfCons
        }
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 400);
  };

  // Comprehensive Reset handler that resets parameters, inputs, and conversation state
  const handleReset = () => {
    setBatteryMwh(2.0);
    setSolarMw(2.5);
    setLoadMw(2.0);
    setPromptInput("");
    setChatMessages([
      ...INITIAL_MESSAGES,
      {
        id: `reset-${Date.now()}`,
        role: "system",
        content: "Simulation and parameters have been reset to factory baseline: 2.0 MWh BESS · 2.5 MW Solar PV · 2.0 MW Load.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setResetNotice("Default baseline restored (2.0 MWh BESS · 2.5 MW Solar · 2.0 MW Load)");
    setTimeout(() => setResetNotice(null), 3500);
  };

  const handleClearChat = () => {
    setChatMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="min-h-screen bg-surface pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text hover:text-accent-dark transition-colors mb-1.5">
              <ArrowLeft size={14} /> Back to Fleet Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-primary-text tracking-tight flex items-center gap-2.5">
              <Sparkles className="text-indigo-600" size={28} />
              AI Scenario What-If Simulator
            </h1>
            <p className="text-secondary-text mt-0.5 text-xs sm:text-sm">
              Conversational scenario simulator &amp; dynamic ROI modeling for <strong className="text-gray-900">{selectedPlant}</strong>.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Reset Button */}
            <button 
              onClick={handleReset} 
              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors shadow-xs cursor-pointer"
              title="Reset sliders and chat to default 2.0 MWh / 2.5 MW baseline"
            >
              <RefreshCw size={14} className="text-gray-500" /> Reset All
            </button>

            {/* Prominent Button to open/redirect to the Assistant */}
            <button 
              onClick={() => openAssistant("What if scenario analysis for " + selectedPlant)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              title="Open full ENERCO Assistant chat drawer"
            >
              <MessageSquare size={14} /> Open Floating Assistant
            </button>

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Temporary Reset Toast Banner */}
        {resetNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {resetNotice}
            </span>
            <button onClick={() => setResetNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-extrabold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. DEDICATED PROPER CHAT INTERFACE PANEL */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/90 shadow-sm overflow-hidden mb-8 flex flex-col">
          {/* Chat Panel Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 flex items-center justify-center font-bold">
                <Bot size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-white">What-If AI Chat Copilot</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Dispatch Synced
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200">
                  Ask natural-language questions — AI updates sliders, recalculates ROI, and plots new curves.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAssistant("What-If simulation details for " + selectedPlant)}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors cursor-pointer"
                title="Pop out into floating full-featured assistant"
              >
                <ExternalLink size={12} /> Pop Out
              </button>
              
              <button
                type="button"
                onClick={handleClearChat}
                className="text-indigo-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Chat Message Scroll Window */}
          <div 
            ref={chatScrollRef}
            className="p-4 sm:p-5 flex-1 min-h-[260px] max-h-[380px] overflow-y-auto bg-slate-50/60 flex flex-col gap-3.5"
          >
            {chatMessages.map((msg) => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <div className="bg-gray-200/80 text-gray-600 text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-300">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end items-start gap-2 max-w-[85%] self-end">
                    <div className="flex flex-col items-end">
                      <div className="bg-indigo-600 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs break-words">
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 font-semibold pr-1">{msg.timestamp}</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      <User size={13} />
                    </span>
                  </div>
                );
              }

              // Assistant message
              return (
                <div key={msg.id} className="flex justify-start items-start gap-2 max-w-[92%] sm:max-w-[85%] self-start">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    <Bot size={15} />
                  </span>

                  <div className="flex flex-col items-start w-full">
                    <div className="bg-white border border-gray-200 text-gray-900 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-xs shadow-xs w-full">
                      <p className="leading-relaxed font-normal text-gray-800 mb-3 whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* Attached Parameters & Results Pill Box */}
                      {msg.appliedParams && (
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600" /> Applied to Visualizer:
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Dynamic Tariff: ₹{msg.appliedParams.dynamicTariff.toFixed(2)}/kWh
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                              <div className="text-[9px] text-gray-400 font-bold uppercase">BESS Battery</div>
                              <div className="text-xs font-black text-blue-600">{msg.appliedParams.batteryMwh.toFixed(1)} MWh</div>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                              <div className="text-[9px] text-gray-400 font-bold uppercase">Solar PV</div>
                              <div className="text-xs font-black text-orange-600">{msg.appliedParams.solarMw.toFixed(1)} MW</div>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                              <div className="text-[9px] text-gray-400 font-bold uppercase">Factory Load</div>
                              <div className="text-xs font-black text-emerald-600">{msg.appliedParams.loadMw.toFixed(1)} MW</div>
                            </div>
                          </div>

                          {msg.metrics && (
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 pt-1 border-t border-indigo-100/80">
                              <span>Payback: <strong className="text-emerald-600">{msg.metrics.roiYears} Yrs</strong></span>
                              <span>Savings: <strong className="text-emerald-600">₹{msg.metrics.annualSavingsLakhs}L/yr</strong></span>
                              <span>Self-Consumption: <strong className="text-indigo-600">{msg.metrics.selfConsumption}%</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 font-semibold pl-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 pl-9 animate-pulse">
                <Bot size={14} className="animate-spin" /> Calculating scenario economics &amp; load curves...
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-gray-50/90 border-t border-gray-100 flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Lightbulb size={11} className="text-amber-500" /> Prompts:
            </span>
            {[
              "Add 4 MWh BESS + 5 MW Solar",
              "Double battery capacity",
              "What if load spikes to 3.5 MW?",
              "Cloudy day: Solar drops by 50%",
              "Target 90% self-consumption",
              "Optimal ROI setup",
              "Why is grid tariff dynamic?"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskScenario(chip)}
                disabled={isProcessing}
                className="text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Interactive Chat Input Box Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAskScenario(); }} 
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input 
                ref={inputRef}
                type="text" 
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask what-if scenario (e.g. 'What if we add 4 MWh battery and solar drops to 1.5 MW?')..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 bg-gray-50/50"
              />
              {promptInput && (
                <button 
                  type="button" 
                  onClick={() => setPromptInput("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[11px] font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isProcessing || !promptInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>

        {/* 2. MAIN SIMULATION DASHBOARD: SLIDERS & VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sliders & Parameter Modifiers */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sliders size={18} className="text-gray-500"/> Manual Sliders
                </h2>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Synced with Chat
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
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-center">
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

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-center">
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

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-center">
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
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-0.5">24-Hour Peak Grid Import Cost Curve</h2>
                  <p className="text-xs text-gray-500">Visualizes peak cost flattening when solar + BESS dispatch covers daytime and evening peaks.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Live Dynamic Model
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
