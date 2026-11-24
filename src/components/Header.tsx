'use client';

import React from 'react';
import { Activity, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  status?: string;
  theme: string;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Header({
  status = 'default',
  theme,
  onToggleTheme,
  onOpenSettings,
}: HeaderProps) {
  const statusDot =
    status === 'green'
      ? 'bg-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]'
      : status === 'red'
      ? 'bg-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
      : 'bg-zinc-500';

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="h-10 sm:h-11 w-full bg-[#0b0d11]/90 backdrop-blur-md border-b border-white/[0.06] px-3.5 sm:px-4 flex items-center justify-between select-none z-40 shrink-0 pt-[env(safe-area-inset-top)]">
      {/* Brand & Live Indicator (Left) */}
      <div className="flex items-center space-x-2">
        <Activity size={15} className="text-zinc-400" />
        <span className="text-sm font-bold tracking-tight text-white">
          GitPulse
        </span>
        <span className={`w-2 h-2 rounded-full ${statusDot}`} />
      </div>

      {/* Action Controls (Right): Theme Toggle + Settings */}
      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle Theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Settings"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <SettingsIcon size={15} />
        </button>
      </div>
    </header>
  );
}
