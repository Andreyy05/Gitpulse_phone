'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CountdownInfo, GitPulseData } from '@/types';

interface HeroStreakCardProps {
  data: GitPulseData | null;
  loading: boolean;
}

export function HeroStreakCard({ data, loading }: HeroStreakCardProps) {
  const [countdown, setCountdown] = useState<CountdownInfo>(calculateCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function calculateCountdown(): CountdownInfo {
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
    const progressPercent = Math.min(100, Math.max(0, (secondsPassed / totalDaySeconds) * 100));

    return {
      formatted: `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      hours,
      minutes,
      seconds,
      isUrgent: hours < 4,
      isCritical: hours === 0 && minutes < 30,
      progressPercent,
    };
  }

  if (loading && !data) {
    return (
      <div className="w-full rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-zinc-800 rounded-full" />
          <div className="h-4 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="h-14 w-24 bg-zinc-800 rounded-xl" />
        <div className="h-4 w-48 bg-zinc-800 rounded" />
        <div className="h-10 bg-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  const hasPushed = data?.hasPushedToday ?? false;
  const currentStreak = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak ?? 0;
  const commitCount = data?.totalCommitsToday ?? 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all p-5 ${
        hasPushed
          ? 'bg-gradient-to-br from-[#0e4429]/30 via-zinc-900/90 to-zinc-950 border-emerald-500/30 shadow-glow'
          : countdown.isCritical
          ? 'bg-gradient-to-br from-rose-950/40 via-zinc-900/90 to-zinc-950 border-rose-500/40 shadow-glow-amber'
          : 'bg-gradient-to-br from-amber-950/20 via-zinc-900/90 to-zinc-950 border-amber-500/30'
      }`}
    >
      {/* Background radial accent */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 ${
          hasPushed ? 'bg-emerald-400' : countdown.isCritical ? 'bg-rose-500' : 'bg-amber-400'
        }`}
      />

      {/* Top Status Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-tight border ${
            hasPushed
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : countdown.isCritical
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}
        >
          {hasPushed ? (
            <CheckCircle2 size={13} className="text-emerald-400" />
          ) : countdown.isCritical ? (
            <ShieldAlert size={13} className="text-rose-400" />
          ) : (
            <AlertTriangle size={13} className="text-amber-400" />
          )}
          <span>
            {hasPushed
              ? 'STREAK ACTIVE'
              : countdown.isCritical
              ? 'CRITICAL: PUSH NOW'
              : 'PENDING PUSH'}
          </span>
        </div>

        {/* Best streak pill */}
        {bestStreak > 0 && (
          <span className="text-xs text-zinc-400 font-medium">
            Best:{' '}
            <span className="font-bold text-zinc-200">
              {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
            </span>
          </span>
        )}
      </div>

      {/* Main Counter & Streak Hero */}
      <div className="grid grid-cols-2 gap-4 my-2 items-end">
        {/* Streak Counter */}
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">
            Current Streak
          </span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-5xl font-black tracking-tight ${
                hasPushed ? 'text-white' : 'text-zinc-200'
              }`}
            >
              {currentStreak}
            </span>
            <span className="text-sm font-semibold text-zinc-400">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
            <Flame
              size={24}
              className={`mb-1 transition-transform ${
                hasPushed
                  ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-110'
                  : currentStreak > 0
                  ? 'text-amber-400 animate-pulse'
                  : 'text-zinc-600'
              }`}
            />
          </div>
        </div>

        {/* Commits Today */}
        <div className="flex flex-col text-right">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">
            Pushed Today
          </span>
          <div className="flex items-baseline justify-end space-x-1.5">
            <span
              className={`text-5xl font-black tracking-tight ${
                commitCount > 0 ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {commitCount}
            </span>
            <span className="text-sm font-semibold text-zinc-400">
              {commitCount === 1 ? 'commit' : 'commits'}
            </span>
          </div>
        </div>
      </div>

      {/* Streak description text */}
      <p className="text-xs text-zinc-400 mt-2">
        {hasPushed
          ? `Streak safe for today. ${
              data?.lastPushTime ? `Last push at ${data.lastPushTime}.` : 'Good job!'
            }`
          : currentStreak > 0
          ? `Push at least 1 commit before midnight to preserve your ${currentStreak}-day streak!`
          : 'Push your first commit today to start a new streak!'}
      </p>

      {/* Countdown to Midnight */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="flex items-center space-x-1.5 text-zinc-400">
            <Clock
              size={13}
              className={
                !hasPushed && countdown.isCritical
                  ? 'text-rose-400 animate-spin'
                  : 'text-zinc-400'
              }
            />
            <span>Time until deadline</span>
          </span>

          <span
            className={`font-mono text-xs font-bold tracking-wider ${
              hasPushed
                ? 'text-zinc-300'
                : countdown.isCritical
                ? 'text-rose-400 animate-pulse'
                : countdown.isUrgent
                ? 'text-amber-400'
                : 'text-zinc-200'
            }`}
          >
            {countdown.formatted}
          </span>
        </div>

        {/* Progress bar to midnight */}
        <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              hasPushed
                ? 'bg-emerald-500'
                : countdown.isCritical
                ? 'bg-rose-500 animate-pulse'
                : countdown.isUrgent
                ? 'bg-amber-500'
                : 'bg-zinc-500'
            }`}
            style={{ width: `${countdown.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
