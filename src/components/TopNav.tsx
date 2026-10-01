"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { mockData } from '@/data/mock';
import { Bell, User, Search, CheckCheck, Info, CircleAlert, TriangleAlert, Zap, AlertTriangle, Bug, Wrench } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/' },
  { name: 'Plant Map', path: '/plant-map' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Assets', path: '/assets' }
];

const SEARCH_DATA = [
  { id: '1', title: 'ENECO MAIN', type: 'Solar Plant', path: '/' },
  { id: '2', title: 'XYZ', type: 'Solar Plant', path: '/plant-map' },
  { id: '3', title: 'ABC', type: 'Location', path: '/plant-map' },
  { id: '4', title: 'California, USA', type: 'Location', path: '/plant-map' },
  { id: '5', title: 'Plant Settings', type: 'Settings', path: '/' },
  { id: '6', title: 'Inverter Array B', type: 'Asset', path: '/assets' },
  { id: '7', title: 'System Diagnostics', type: 'Settings', path: '/analytics' },
];

export function TopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const bellRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { notifications, markNotificationRead, markAllNotificationsRead, activeSimulations, triggerSimulation, fixSimulation } = useSimulation();
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsSearchOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const searchResults = SEARCH_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <TriangleAlert size={16} className="text-warning" />;
      case 'critical': return <CircleAlert size={16} className="text-danger" />;
      case 'maintenance': return <CircleAlert size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-info" />;
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
      <nav className="glass-nav px-2 py-2 flex items-center gap-2 pointer-events-auto max-w-6xl w-full justify-between">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-sm">
            E
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-lg tracking-tight">ENECO Solar</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-background/50 rounded-full p-1 border border-border/50">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 inline-block text-center",
                  isActive
                    ? "bg-accent text-white shadow-md shadow-accent/20" 
                    : "text-secondary-text hover:text-primary-text hover:bg-surface/80"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pr-2">
          <div className="relative hidden md:block group" ref={searchRef}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text group-focus-within:text-accent-dark transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets, events..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="pl-9 pr-4 py-2 rounded-full bg-surface/80 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent w-48 transition-all focus:w-64 placeholder-secondary-text/70"
            />
            
            {/* Search Dropdown */}
            {isSearchOpen && searchQuery.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link 
                        href={item.path} 
                        key={item.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-border/50 last:border-0 transition-colors"
                      >
                        <div className="font-bold text-primary-text text-sm">{item.title}</div>
                        <div className="text-xs text-emerald-400 mt-0.5">{item.type}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-sm text-secondary-text text-center">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setIsOpen((prev) => !prev); setIsProfileOpen(false); }}
              className={cn(
                "p-2 text-secondary-text hover:text-accent-dark hover:bg-accent/10 rounded-full transition-colors relative cursor-pointer active:scale-95",
                isOpen && "text-accent-dark bg-accent/10"
              )}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-sm font-bold text-primary-text">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-danger/10 text-danger text-[10px] font-bold shrink-0">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1.5 text-xs font-semibold text-accent-dark hover:underline disabled:text-secondary-text/50 disabled:no-underline disabled:cursor-default transition-colors shrink-0 cursor-pointer"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-secondary-text">
                      You have no notifications.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-gray-50 cursor-pointer",
                          !notification.read && "bg-accent/5"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-primary-text">
                              {notification.title}
                            </span>
                            <span className="text-[11px] text-secondary-text shrink-0 mt-0.5">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs text-secondary-text leading-snug line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0"></span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-border bg-gray-50/50">
                  <Link
                    href="/assets"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-xs font-bold text-accent-dark hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsOpen(false); }}
              className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors active:scale-95"
            >
               <User size={20} className="text-gray-500" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-border bg-gray-50">
                  <div className="font-bold text-primary-text text-sm mb-1">Developer Mode</div>
                  <div className="text-xs text-secondary-text">Test real-time event triggers</div>
                </div>
                
                <div className="p-4 border-b border-border">
                  <div className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-3">Trigger Simulations</div>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => triggerSimulation('Temperature Overload')}
                      className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                    >
                      <Zap size={14} /> Temperature Overload
                    </button>
                    <button 
                      onClick={() => triggerSimulation('Communication Failure')}
                      className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium rounded-lg bg-warning/10 text-warning-dark hover:bg-warning hover:text-white transition-colors"
                    >
                      <AlertTriangle size={14} /> Communication Failure
                    </button>
                    <button 
                      onClick={() => triggerSimulation('Voltage Drop')}
                      className="flex items-center gap-2 text-left px-3 py-2 text-sm font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition-colors"
                    >
                      <Bug size={14} /> Voltage Drop
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50/50">
                  <div className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-3">Fix Events</div>
                  {activeSimulations.length === 0 ? (
                    <div className="text-xs text-secondary-text italic">No active simulations to fix.</div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {activeSimulations.map(sim => (
                        <div key={sim.id} className="bg-white border border-border rounded-lg p-2 flex justify-between items-center shadow-sm">
                          <div>
                            <div className="text-xs font-bold text-primary-text">{sim.type}</div>
                            <div className="text-[10px] text-secondary-text">{sim.plantName} - {sim.panelId}</div>
                          </div>
                          <button 
                            onClick={() => fixSimulation(sim.id)}
                            className="p-1.5 rounded-md bg-success/10 text-success hover:bg-success hover:text-white transition-colors"
                            title="Fix Issue"
                          >
                            <Wrench size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-white border-t border-border">
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + "Asset ID,Plant Name,Status,AC Power (kW),DC Power (kW),Efficiency (%),Temperature (°C)\n"
                        + "INV-01,ENECO Chennai,Normal,450.2,465.1,96.8,42.5\n"
                        + "INV-02,ENECO Chennai,Normal,448.9,463.8,96.7,43.1\n"
                        + "INV-03,ENECO Chennai,Warning,420.5,462.1,91.0,48.2\n"
                        + "INV-04,ENECO Chennai,Normal,451.0,466.0,96.7,41.9\n"
                        + "INV-05,ENECO Coimbatore,Critical,0.0,460.5,0.0,55.4\n";
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "enflo_asset_report.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download CSV Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
