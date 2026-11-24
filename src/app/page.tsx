'use client';

import React from 'react';
import { useGitPulse } from '@/hooks/useGitPulse';
import { Header } from '@/components/Header';
import { HeroStreakCard } from '@/components/HeroStreakCard';
import { InteractiveContributionHeatmap } from '@/components/InteractiveContributionHeatmap';
import { RecentActivityFeed } from '@/components/RecentActivityFeed';
import { InsightsCard } from '@/components/InsightsCard';
import { RepoQuicklinks } from '@/components/RepoQuicklinks';
import { CommitFuelCard } from '@/components/CommitFuelCard';
import { SettingsModal } from '@/components/SettingsModal';
import { BottomNav } from '@/components/BottomNav';
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const {
    settings,
    data,
    loading,
    isRefreshing,
    error,
    activeTab,
    changeTab,
    refresh,
    isSettingsOpen,
    setIsSettingsOpen,
    saveSettings,
  } = useGitPulse();

  return (
    <div className="w-full max-w-md min-h-screen flex flex-col bg-[#090d12] pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-zinc-100">
      {/* Fixed Sticky Header */}
      <Header
        data={data}
        loading={loading}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Offline Banner */}
        {data?.isOffline && (
          <div className="px-3.5 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WifiOff size={14} className="text-sky-400 shrink-0" />
              <span>
                {data.offlineReason || 'Operating from offline cache'}
              </span>
            </div>
            <button
              onClick={refresh}
              className="text-[11px] font-semibold underline text-sky-400 hover:text-sky-200 ml-2 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Rate Limit Warning Banner */}
        {data?.rateLimitWarning && (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>{data.rateLimitWarning}</span>
          </div>
        )}

        {/* Error Display */}
        {error && !data && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={15} className="text-rose-400 shrink-0" />
              <p className="font-semibold text-rose-200">Unable to load activity</p>
            </div>
            <p className="text-[11px] text-rose-400/90">{error}</p>
            <div className="pt-1 flex items-center space-x-2">
              <button
                onClick={refresh}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold flex items-center space-x-1"
              >
                <RefreshCw size={12} />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
              >
                Change Username
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Pulse (Hero Streak + Heatmap + Today's Pushes) */}
        {activeTab === 'pulse' && (
          <div className="space-y-4 animate-fadeIn">
            <HeroStreakCard data={data} loading={loading} />
            <InteractiveContributionHeatmap data={data} loading={loading} />
            <RecentActivityFeed
              pushes={data?.recentPushes || []}
              hasPushedToday={data?.hasPushedToday || false}
            />
          </div>
        )}

        {/* Tab 2: Insights (Velocity + Weekday Rhythm + Year Heatmap) */}
        {activeTab === 'insights' && (
          <div className="space-y-4 animate-fadeIn">
            <InsightsCard stats={data?.stats} loading={loading} />
            <InteractiveContributionHeatmap data={data} loading={loading} />
          </div>
        )}

        {/* Tab 3: Repos (Quicklinks + Pinned Repos) */}
        {activeTab === 'repos' && (
          <div className="space-y-4 animate-fadeIn">
            <RepoQuicklinks
              repositories={data?.repositories}
              loading={loading}
            />
          </div>
        )}

        {/* Tab 4: Fuel (Commit Generator) */}
        {activeTab === 'fuel' && (
          <div className="space-y-4 animate-fadeIn">
            <CommitFuelCard />
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={changeTab}
        hasPushedToday={data?.hasPushedToday || false}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveSettings}
      />
    </div>
  );
}
