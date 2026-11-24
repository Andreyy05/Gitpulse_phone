'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Award,
  Calendar,
  GitFork,
  ExternalLink,
} from 'lucide-react';
import { ExtendedStats } from '@/types';
import { YearHeatmap } from './YearHeatmap';

interface StatsCardProps {
  stats?: ExtendedStats | null;
  loading: boolean;
}

export function StatsCard({ stats, loading }: StatsCardProps) {
  const [activeWindow, setActiveWindow] = useState<'30' | '90'>('30');

  if (!stats) {
    if (loading) {
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-white/[0.06] rounded" />
            <div className="h-6 w-24 bg-white/[0.06] rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-white/[0.02] rounded-xl border border-white/[0.03]" />
            <div className="h-16 bg-white/[0.02] rounded-xl border border-white/[0.03]" />
          </div>
        </div>
      );
    }
    return null;
  }

  const commitsCount =
    activeWindow === '30' ? stats.commits30Days : stats.commits90Days;
  const dailyAverage =
    activeWindow === '30' ? stats.dailyAverage : stats.dailyAverage90;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-sm flex flex-col space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-zinc-200 tracking-tight">
          <BarChart3 size={14} className="text-zinc-400" />
          <span>Commit Insights</span>
        </div>

        {/* 30d vs 90d Toggle */}
        <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          {[
            { id: '30' as const, label: 'Last 30d' },
            { id: '90' as const, label: 'Last 90d' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveWindow(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs tracking-tight transition-all font-medium ${
                activeWindow === t.id
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total in Period */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
            <span>Total Commits</span>
            <TrendingUp size={12} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {commitsCount}
            </span>
            <span className="text-[10px] text-zinc-500">in {activeWindow}d</span>
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
            <span>Daily Average</span>
            <Zap size={12} className="text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {dailyAverage}
            </span>
            <span className="text-[10px] text-zinc-500">commits/day</span>
          </div>
        </div>
      </div>

      {/* Peak Day of the Week Card */}
      {stats.mostActiveDay && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Most Active Day
              </p>
              <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                {stats.mostActiveDay.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-emerald-400">
              {stats.mostActiveDay.count} commits
            </span>
            {stats.mostActiveDay.percentage > 0 && (
              <p className="text-[10px] text-zinc-500">
                {stats.mostActiveDay.percentage}% of weekly output
              </p>
            )}
          </div>
        </div>
      )}

      {/* Weekly Activity Distribution Bar Chart */}
      {stats.dayDistribution && stats.dayDistribution.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
            <span className="flex items-center space-x-1.5">
              <Calendar size={12} />
              <span>Weekly Rhythm</span>
            </span>
            <span className="text-[11px] text-zinc-500">Mon — Sun</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
            {stats.dayDistribution.map((d) => (
              <div
                key={d.name}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                <div
                  title={`${d.fullName}: ${d.count} commits`}
                  className={`w-full rounded-t transition-all ${
                    d.isMax
                      ? 'bg-emerald-400'
                      : d.count > 0
                      ? 'bg-white/20'
                      : 'bg-white/[0.05]'
                  }`}
                  style={{
                    height: `${Math.max(12, d.percentOfMax)}%`,
                  }}
                />
                <span className="text-[9px] text-zinc-400 mt-1 font-mono">
                  {d.name.slice(0, 2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Active Repository */}
      {stats.mostActiveRepo && (
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="text-xs text-zinc-400 mb-2 font-medium flex items-center space-x-1.5">
            <GitFork size={12} />
            <span>Top Active Repo</span>
          </div>

          <a
            href={stats.mostActiveRepo.url}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2 truncate max-w-[200px]">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                {stats.mostActiveRepo.name}
              </span>
              <ExternalLink size={11} className="text-zinc-500 shrink-0" />
            </div>

            <span className="text-xs font-semibold text-emerald-400 shrink-0">
              {stats.mostActiveRepo.commits} commits ({stats.mostActiveRepo.pushes} pushes)
            </span>
          </a>
        </div>
      )}

      {/* Full-Year Heatmap */}
      <YearHeatmap
        yearWeeks={stats.yearWeeks}
        totalContributions={stats.totalYearContributions}
      />
    </div>
  );
}
