'use client';

import React from 'react';
import { Flame, BarChart3, Bookmark, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'pulse' | 'insights' | 'repos' | 'fuel';
  onChangeTab: (tab: 'pulse' | 'insights' | 'repos' | 'fuel') => void;
  hasPushedToday: boolean;
}

export function BottomNav({
  activeTab,
  onChangeTab,
  hasPushedToday,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'pulse' as const,
      label: 'Pulse',
      icon: Flame,
      indicator: hasPushedToday,
    },
    {
      id: 'insights' as const,
      label: 'Insights',
      icon: BarChart3,
    },
    {
      id: 'repos' as const,
      label: 'Repos',
      icon: Bookmark,
    },
    {
      id: 'fuel' as const,
      label: 'Fuel',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full backdrop-blur-xl bg-zinc-950/90 dark:bg-[#0d1117]/95 border-t border-zinc-800/80 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 px-3">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center space-y-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {tab.indicator && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
