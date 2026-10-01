"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, Bell, User, ChevronDown, Search } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', path: '/' },
  { name: 'Plant Map', path: '/plant-map' },
  { name: 'Analytics', path: '/analytics' },
  { name: 'Assets', path: '/assets' }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
      <nav className="glass-nav px-2 py-2 flex items-center gap-2 pointer-events-auto max-w-6xl w-full justify-between">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-sm">
            E
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-lg tracking-tight">ENFLO Solar</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-background/50 rounded-full p-1 border border-border/50">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name}
                href={item.path}
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
          <div className="relative hidden md:block group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text group-focus-within:text-accent-dark transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets, events..." 
              className="pl-9 pr-4 py-2 rounded-full bg-surface/80 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent w-48 transition-all focus:w-64 placeholder-secondary-text/70"
            />
          </div>
          <button className="p-2 text-secondary-text hover:text-accent-dark hover:bg-accent/10 rounded-full transition-colors relative cursor-pointer active:scale-95">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white"></span>
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors active:scale-95">
             <User size={20} className="text-gray-500" />
          </button>
        </div>
      </nav>
    </div>
  );
}
