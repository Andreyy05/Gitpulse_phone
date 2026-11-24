'use client';

import React from 'react';
import { useGitPulse, TabType } from '@/hooks/useGitPulse';
import { Header } from '@/components/Header';
import { StatusCard } from '@/components/StatusCard';
import { StatsCard } from '@/components/StatsCard';
import { RepoQuicklinks } from '@/components/RepoQuicklinks';
import { CommitFuel } from '@/components/CommitFuel';
import { SettingsModal } from '@/components/SettingsModal';
import { Activity, BarChart2, GitFork, Layers } from 'lucide-react';

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pulse', label: 'Pulse', icon: Activity },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'repos', label: 'Repos', icon: GitFork },
  { id: 'all', label: 'All', icon: Layers },
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
      <main className="flex-1 w-full p-3.5 sm:p-5 md:p-6 overflow-y-auto flex flex-col items-center justify-start pb-28 sm:pb-32">
        <div className="w-full max-w-md sm:max-w-lg space-y-3.5 sm:space-y-4">
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

      {/* Fixed Phone App Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3.5 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="w-full max-w-md sm:max-w-lg bg-[#0e1217]/92 backdrop-blur-xl p-1 sm:p-1.5 rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/90 flex items-center justify-between pointer-events-auto transition-colors">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex-1 py-2 sm:py-2.5 flex items-center justify-center space-x-1.5 rounded-xl text-xs sm:text-sm font-medium tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

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
