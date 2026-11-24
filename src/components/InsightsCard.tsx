'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Award, Calendar, GitFork, ExternalLink } from 'lucide-react';
import { ExtendedStats } from '@/types';

interface InsightsCardProps {
  stats?: ExtendedStats | null;
  loading: boolean;
}

export function InsightsCard({ stats, loading }: InsightsCardProps) {
  const [windowRange, setWindowRange] = useState<'30' | '90'>('30');

  if (loading && !stats) {
    return (
      <div className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4 animate-pulse">
        <div className="h-6 w-36 bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-zinc-800/60 rounded-xl" />
          <div className="h-20 bg-zinc-800/60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalCommits =
    windowRange === '30' ? stats.commits30Days : stats.commits90Days;
  const dailyAverage =
    windowRange === '30' ? stats.dailyAverage : stats.dailyAverage90;

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <BarChart3 size={15} className="text-emerald-400" />
          <span>Velocity & Insights</span>
        </div>

        {/* 30d vs 90d Toggle */}
        <div className="flex items-center p-0.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-medium">
          {(['30', '90'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setWindowRange(r)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                windowRange === r
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Last {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Total Commits & Daily Average */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Commits</span>
            <TrendingUp size={13} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalCommits}
            </span>
            <span className="text-[11px] text-zinc-500">in {windowRange}d</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Daily Average</span>
            <Zap size={13} className="text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">
              {dailyAverage}
            </span>
            <span className="text-[11px] text-zinc-500">commits/day</span>
          </div>
        </div>
      </div>

      {/* Peak Weekday Output */}
      {stats.mostActiveDay && (
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400">Peak Weekday</p>
              <p className="text-sm font-semibold text-zinc-200">
                {stats.mostActiveDay.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">
              {stats.mostActiveDay.count} commits
            </p>
            {stats.mostActiveDay.percentage > 0 && (
              <p className="text-[10px] text-zinc-500">
                {stats.mostActiveDay.percentage}% of weekly output
              </p>
            )}
          </div>
        </div>
      )}

      {/* Weekly Rhythm Bar Chart */}
      {stats.dayDistribution && stats.dayDistribution.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <Calendar size={13} />
              <span>Weekly Rhythm</span>
            </span>
            <span className="text-[11px] text-zinc-500">Mon — Sun</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
            {stats.dayDistribution.map((d) => (
              <div
                key={d.name}
                className="flex-1 flex flex-col items-center h-full justify-end"
              >
                <div
                  title={`${d.fullName}: ${d.count} commits`}
                  className={`w-full rounded-t transition-all ${
                    d.isMax
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : d.count > 0
                      ? 'bg-zinc-600'
                      : 'bg-zinc-800'
                  }`}
                  style={{ height: `${Math.max(12, d.percentOfMax)}%` }}
                />
                <span className="text-[9px] text-zinc-400 mt-1 font-mono">
                  {d.name.slice(0, 2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Active Repository */}
      {stats.mostActiveRepo && (
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="text-xs text-zinc-400 mb-2 flex items-center space-x-1.5">
            <GitFork size={13} />
            <span>Top Active Repo</span>
          </div>

          <a
            href={stats.mostActiveRepo.url}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center space-x-2 truncate max-w-[200px]">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                {stats.mostActiveRepo.name}
              </span>
              <ExternalLink size={11} className="text-zinc-500 shrink-0" />
            </div>

            <span className="text-xs font-bold text-emerald-400 shrink-0">
              {stats.mostActiveRepo.commits} commits
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
