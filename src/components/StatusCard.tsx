'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  GitCommit,
  Clock,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Flame,
  WifiOff,
} from 'lucide-react';
import { GitPulseData, HistoryTimelineDay } from '@/types';

interface StatusCardProps {
  data: GitPulseData | null;
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
}

export function StatusCard({ data, loading, error, onRefresh }: StatusCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  const [hoveredDay, setHoveredDay] = useState<HistoryTimelineDay | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [data?.avatarUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.max(0, midnight.getTime() - now.getTime());

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    const totalDaySeconds = 24 * 3600;
    const secondsPassed = 24 * 3600 - Math.floor(diff / 1000);
    const progressPercent = Math.min(
      100,
      Math.max(0, (secondsPassed / totalDaySeconds) * 100)
    );

    return {
      formatted: `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      isUrgent: hours < 4,
      isCritical: hours === 0 && minutes < 30,
      progressPercent,
    };
  }

  const hasPushed = data?.hasPushedToday;
  const commitCount = data?.totalCommitsToday || 0;

  const handleOpenProfile = () => {
    if (data?.username) {
      window.open(`https://github.com/${data.username}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col space-y-3.5 sm:space-y-4">
      {/* 1. User Info Bar */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {!avatarError && data?.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data?.username || 'User'}
              onError={() => setAvatarError(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/[0.08] object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0 font-medium text-xs">
              {data?.username ? (
                data.username.slice(0, 2).toUpperCase()
              ) : (
                <User size={14} />
              )}
            </div>
          )}
          <div className="flex flex-col">
            <button
              onClick={handleOpenProfile}
              className="text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white flex items-center space-x-1 transition-colors text-left tracking-tight"
              title="Open GitHub Profile"
            >
              <span>@{data?.username || 'user'}</span>
              <ExternalLink size={11} className="text-zinc-500" />
            </button>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-zinc-500">
                {data?.updatedAt
                  ? `Synced ${new Date(data.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Not synced'}
              </span>
              {data?.isOffline && (
                <span
                  title={data?.offlineReason || 'Operating from offline cache'}
                  className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400"
                >
                  <WifiOff size={9} />
                  <span>Offline cache</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] active:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors disabled:opacity-50 flex items-center space-x-1.5 text-xs font-medium"
          title="Refresh now"
        >
          <RefreshCw
            size={12}
            className={loading ? 'animate-spin text-zinc-400' : 'text-zinc-400'}
          />
          <span className="font-medium">Sync</span>
        </button>
      </div>

      {/* 2. Streak Badge Row */}
      {data && (data.currentStreak > 0 || data.bestStreak > 0) && (
        <div className="flex items-center justify-between px-0.5">
          {/* Current Streak Pill */}
          <div
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border ${
              data.currentStreak >= 7
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                : data.currentStreak >= 1
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
            }`}
          >
            <Flame
              size={13}
              className={
                data.currentStreak >= 7
                  ? 'text-emerald-400'
                  : data.currentStreak >= 1
                  ? 'text-amber-400'
                  : 'text-zinc-500'
              }
            />
            <span>
              {data.currentStreak === 0
                ? 'No active streak'
                : data.currentStreak === 1
                ? '1-day streak'
                : `${data.currentStreak}-day streak`}
            </span>
          </div>

          {/* Best Streak */}
          {data.bestStreak > 0 && (
            <span className="text-xs text-zinc-500 tracking-tight font-medium">
              Best:{' '}
              <span className="font-bold text-zinc-200">
                {data.bestStreak}d
              </span>
            </span>
          )}
        </div>
      )}

      {/* 3. Main Status Hero Card */}
      {error ? (
        <div className="p-4 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Unable to check activity</p>
            <p className="text-[11px] text-rose-400/90 mt-0.5">{error}</p>
          </div>
        </div>
      ) : (
        <div className="relative p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-sm transition-all">
          {/* Status Pill Header */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight ${
                hasPushed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasPushed ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{hasPushed ? 'STREAK ACTIVE' : 'PENDING PUSH'}</span>
            </div>

            <span
              className={`text-xs font-medium tracking-tight ${
                hasPushed ? 'text-zinc-400' : 'text-amber-400/90'
              }`}
            >
              {hasPushed ? 'Safe today' : 'Streak at risk'}
            </span>
          </div>

          {/* Commits Big Counter */}
          <div className="flex items-baseline space-x-3.5 my-3 sm:my-4">
            <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
              {commitCount}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 tracking-tight">
                {commitCount === 1
                  ? '1 commit pushed today'
                  : `${commitCount} commits pushed today`}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-500">
                {hasPushed
                  ? `Last push at ${data?.lastPushTime || 'Today'}`
                  : 'No commits detected on public events yet'}
              </span>
            </div>
          </div>

          {/* Countdown to Midnight */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="text-zinc-400 flex items-center space-x-1.5 font-medium">
                <Clock
                  size={12}
                  className={
                    !hasPushed && timeLeft.isCritical
                      ? 'text-rose-500 animate-pulse'
                      : 'text-zinc-400'
                  }
                />
                <span>Time until midnight:</span>
              </span>
              <span
                className={`font-mono text-xs sm:text-sm font-semibold ${
                  hasPushed
                    ? 'text-zinc-200'
                    : timeLeft.isCritical
                    ? 'text-rose-400 font-bold animate-pulse'
                    : timeLeft.isUrgent
                    ? 'text-amber-400'
                    : 'text-zinc-200'
                }`}
              >
                {timeLeft.formatted}
              </span>
            </div>

            {/* Time progress bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  hasPushed
                    ? 'bg-emerald-500'
                    : timeLeft.isCritical
                    ? 'bg-rose-500 animate-pulse'
                    : timeLeft.isUrgent
                    ? 'bg-amber-500'
                    : 'bg-zinc-400'
                }`}
                style={{ width: `${timeLeft.progressPercent}%` }}
              />
            </div>
          </div>

          {/* 14-Day Activity Heatmap */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-zinc-400 flex items-center space-x-1.5 font-medium">
                <Calendar size={12} className="text-zinc-400" />
                <span>14-Day Activity</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                {hoveredDay ? (
                  <span className="text-zinc-200 font-semibold">
                    {hoveredDay.date}: {hoveredDay.count}{' '}
                    {hoveredDay.count === 1 ? 'commit' : 'commits'}
                  </span>
                ) : (
                  <span>{data?.total14DaysCommits || 0} commits total</span>
                )}
              </span>
            </div>

            {/* 14-Square Row */}
            <div className="flex items-center justify-between gap-1.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
              {data?.history14Days ? (
                data.history14Days.map((day) => {
                  let colorClass =
                    'bg-white/[0.05] border border-white/[0.04]';
                  if (day.level === 1) {
                    colorClass =
                      'bg-emerald-950/70 border border-emerald-900/60';
                  } else if (day.level === 2) {
                    colorClass =
                      'bg-emerald-700/70 border border-emerald-600/60';
                  } else if (day.level >= 3) {
                    colorClass =
                      'bg-emerald-500 border border-emerald-400';
                  }

                  const isSelected = hoveredDay?.date === day.date;

                  return (
                    <button
                      key={day.date}
                      onClick={() =>
                        setHoveredDay(isSelected ? null : day)
                      }
                      title={`${day.date}: ${day.count} commit(s)`}
                      className={`flex-1 h-5 sm:h-7 rounded-[4px] sm:rounded-md border transition-all ${colorClass} ${
                        day.isToday
                          ? 'border-2 border-white/60 ring-2 ring-white/30'
                          : ''
                      } ${isSelected ? 'scale-110 ring-2 ring-white' : ''}`}
                    />
                  );
                })
              ) : (
                Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-5 sm:h-7 rounded-[4px] bg-white/[0.04] border border-white/[0.04] animate-pulse"
                  />
                ))
              )}
            </div>

            {/* Legend & Labels */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 px-0.5">
              <span>14d ago</span>
              <div className="flex items-center space-x-1">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.05] border border-white/[0.04] inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950/70 border border-emerald-900/60 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700/70 border border-emerald-600/60 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400 inline-block" />
                <span>More</span>
              </div>
              <span className="text-zinc-300 font-medium">Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Pushes Today */}
      {data?.recentPushes && data.recentPushes.length > 0 && (
        <div className="px-0.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center space-x-1.5 font-medium text-zinc-200">
              <GitCommit size={12} className="text-zinc-400" />
              <span>Today&apos;s Activity</span>
            </span>
            <span className="text-[11px] text-zinc-500">
              {data.recentPushes.length} event(s)
            </span>
          </div>

          <div className="space-y-1.5">
            {data.recentPushes.map((push) => (
              <a
                key={push.id}
                href={push.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] transition-colors flex items-center justify-between text-xs block group"
              >
                <div className="flex items-center space-x-2 truncate max-w-[220px]">
                  <span className="font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                    {push.repo}
                  </span>
                  <ExternalLink
                    size={10}
                    className="text-zinc-500 shrink-0 group-hover:text-zinc-300"
                  />
                </div>
                <div className="flex items-center space-x-2 text-[11px] shrink-0">
                  <span className="text-emerald-400 font-medium">
                    {push.commitCount} {push.commitCount === 1 ? 'commit' : 'commits'}
                  </span>
                  <span className="text-zinc-500">{push.time}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
