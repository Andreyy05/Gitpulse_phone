'use client';

import React from 'react';
import { useGitPulse, TabType } from '@/hooks/useGitPulse';
import { Header } from '@/components/Header';
import { StatusCard } from '@/components/StatusCard';
import { StatsCard } from '@/components/StatsCard';
import { RepoQuicklinks } from '@/components/RepoQuicklinks';
import { CommitFuel } from '@/components/CommitFuel';
import { SettingsModal } from '@/components/SettingsModal';

const TABS: { id: TabType; label: string }[] = [
  { id: 'pulse', label: 'Pulse' },
  { id: 'stats', label: 'Stats' },
  { id: 'repos', label: 'Repos' },
  { id: 'all', label: 'All' },
];

export default function HomePage() {
  const {
    settings,
    data,
    loading,
    error,
    activeTab,
    changeTab,
    toggleTheme,
    refresh,
    isSettingsOpen,
    setIsSettingsOpen,
    saveSettings,
  } = useGitPulse();

  const currentStatus = data?.hasPushedToday
    ? 'green'
    : data
    ? 'red'
    : 'default';

  return (
    <div className="w-full min-h-screen bg-[#0b0d11] text-zinc-100 flex flex-col font-sans select-none transition-colors duration-200">
      {/* Top Header with Activity Icon & Actions */}
      <Header
        status={currentStatus}
        theme={settings.theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Container (Max width for phone/desktop center frame) */}
      <main className="flex-1 w-full p-3.5 sm:p-5 md:p-6 overflow-y-auto flex flex-col items-center justify-start pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="w-full max-w-md sm:max-w-lg space-y-3.5 sm:space-y-4">
          {/* Segmented Navigation Tab Bar */}
          <div className="w-full flex items-center justify-between bg-white/[0.04] p-1 rounded-xl sm:rounded-2xl border border-white/[0.06] transition-colors">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex-1 py-1 sm:py-1.5 text-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium tracking-tight transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-none font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Pulse Card View */}
          {(activeTab === 'pulse' || activeTab === 'all') && (
            <StatusCard
              data={data}
              loading={loading}
              error={error}
              onRefresh={refresh}
            />
          )}

          {/* Tab 2: Extended Stats View */}
          {(activeTab === 'stats' || activeTab === 'all') && (
            <StatsCard
              stats={data?.stats}
              loading={loading}
            />
          )}

          {/* Tab 3: Repositories Quicklinks View */}
          {(activeTab === 'repos' || activeTab === 'all') && (
            <RepoQuicklinks
              repositories={data?.repositories}
              loading={loading}
            />
          )}

          {/* Commit Fuel Section */}
          {(activeTab === 'pulse' || activeTab === 'all') && (
            <CommitFuel />
          )}
        </div>
      </main>

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
