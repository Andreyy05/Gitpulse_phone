'use client';

import React, { useState } from 'react';
import { RefreshCw, Settings, User, WifiOff, ExternalLink } from 'lucide-react';
import { GitPulseData } from '@/types';

interface HeaderProps {
  data: GitPulseData | null;
  loading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export function Header({
  data,
  loading,
  isRefreshing,
  onRefresh,
  onOpenSettings,
}: HeaderProps) {
  const [avatarError, setAvatarError] = useState(false);

  const formattedTime = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/85 dark:bg-[#0d1117]/90 border-b border-zinc-800/60 dark:border-zinc-800/80 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & User identity */}
        <div className="flex items-center space-x-3">
          <div className="relative shrink-0">
            {!avatarError && data?.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.username}
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 ring-2 ring-emerald-500/30 flex items-center justify-center text-zinc-300 font-semibold text-xs">
                {data?.username ? (
                  data.username.slice(0, 2).toUpperCase()
                ) : (
                  <User size={16} />
                )}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                data?.hasPushedToday ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold tracking-tight text-white flex items-center">
                GitPulse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PWA
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
              <a
                href={data?.username ? `https://github.com/${data.username}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-200 transition-colors flex items-center space-x-0.5"
              >
                <span>@{data?.username || 'user'}</span>
                <ExternalLink size={10} className="text-zinc-500" />
              </a>
              <span>•</span>
              {data?.isOffline ? (
                <span className="text-amber-400 flex items-center space-x-0.5 font-medium text-[11px]">
                  <WifiOff size={10} />
                  <span>Offline</span>
                </span>
              ) : formattedTime ? (
                <span className="text-[11px] text-zinc-400">
                  {isRefreshing ? 'Syncing...' : `Synced ${formattedTime}`}
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">Connecting...</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: 44px touch targets */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onRefresh}
            disabled={loading || isRefreshing}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white active:bg-zinc-800/80 transition-colors disabled:opacity-50"
            aria-label="Refresh data"
            title="Refresh activity"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? 'animate-spin text-emerald-400' : ''}
            />
          </button>

          <button
            onClick={onOpenSettings}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white active:bg-zinc-800/80 transition-colors"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
