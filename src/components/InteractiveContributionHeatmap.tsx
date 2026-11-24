'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { ContributionDay, GitPulseData, HistoryTimelineDay, YearWeek } from '@/types';

interface InteractiveContributionHeatmapProps {
  data: GitPulseData | null;
  loading: boolean;
}

type HeatmapRange = '14' | '30' | '90' | 'year';

const LEVEL_COLORS = [
  'bg-zinc-800/80 border-zinc-700/40', // 0 commits
  'bg-[#0e4429] border-[#0e4429]', // 1-2
  'bg-[#006d32] border-[#006d32]', // 3-5
  'bg-[#26a641] border-[#26a641]', // 6-9
  'bg-[#39d353] border-[#39d353]', // 10+
];

export function InteractiveContributionHeatmap({
  data,
  loading,
}: InteractiveContributionHeatmapProps) {
  const [range, setRange] = useState<HeatmapRange>('14');
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    count: number;
    tip?: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest date on right when viewing full year
  useEffect(() => {
    if (range === 'year' && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'auto',
      });
    }
  }, [range]);

  // Format nice human-readable date label
  const formatDayTooltip = (dateStr: string, count: number) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${month} ${d}: ${count} ${count === 1 ? 'commit' : 'commits'}`;
    } catch {
      return `${dateStr}: ${count} commits`;
    }
  };

  // Build items based on selected range
  const days14 = data?.history14Days || [];

  const days30or90 = useMemo(() => {
    if (!data?.yearWeeks || data.yearWeeks.length === 0) return [];
    const allDays: ContributionDay[] = [];
    for (const week of data.yearWeeks) {
      for (const day of week.days) {
        if (!day.isFuture) {
          allDays.push(day);
        }
      }
    }
    const count = range === '30' ? 30 : range === '90' ? 90 : 14;
    return allDays.slice(-count);
  }, [data?.yearWeeks, range]);

  if (loading && !data) {
    return (
      <div className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-28 bg-zinc-800 rounded" />
          <div className="h-6 w-36 bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-20 bg-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-4">
      {/* Header with Title and Range Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <Calendar size={15} className="text-emerald-400" />
          <span>Activity Heatmap</span>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center p-0.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-medium">
          {(
            [
              { id: '14', label: '14d' },
              { id: '30', label: '30d' },
              { id: '90', label: '90d' },
              { id: 'year', label: 'Year' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setRange(t.id);
                setSelectedDay(null);
              }}
              className={`px-2 py-1 rounded-md transition-all ${
                range === t.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Tooltip / Pill */}
      <div className="min-h-[28px] flex items-center justify-between bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-zinc-800/60 text-xs">
        {selectedDay ? (
          <span className="font-medium text-emerald-300">
            {formatDayTooltip(selectedDay.date, selectedDay.count)}
          </span>
        ) : (
          <span className="text-zinc-500 text-[11px]">
            Tap any cell to inspect exact commits
          </span>
        )}

        {range === '14' && (
          <span className="text-[11px] text-zinc-400 font-medium">
            Total: {data?.total14DaysCommits ?? 0}
          </span>
        )}
        {range === '30' && (
          <span className="text-[11px] text-zinc-400 font-medium">
            Total: {data?.stats?.commits30Days ?? 0}
          </span>
        )}
        {range === '90' && (
          <span className="text-[11px] text-zinc-400 font-medium">
            Total: {data?.stats?.commits90Days ?? 0}
          </span>
        )}
        {range === 'year' && (
          <span className="text-[11px] text-zinc-400 font-medium">
            Total: {data?.totalYearContributions ?? 0}
          </span>
        )}
      </div>

      {/* 14-Day View (Mobile 2x7 or 14-grid) */}
      {range === '14' && (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days14.map((day, idx) => {
            const isSelected = selectedDay?.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`relative aspect-square rounded-md border transition-all flex flex-col items-center justify-center p-1 ${
                  LEVEL_COLORS[Math.min(day.level, 4)]
                } ${
                  day.isToday
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900'
                    : ''
                } ${isSelected ? 'scale-105 ring-2 ring-white' : 'active:scale-95'}`}
                aria-label={`${day.date}: ${day.count} commits`}
              >
                <span className="text-[9px] font-semibold text-zinc-300 opacity-90">
                  {day.count > 0 ? day.count : ''}
                </span>
                {day.isToday && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 30-Day View */}
      {range === '30' && (
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
          {days30or90.map((day) => {
            const isSelected = selectedDay?.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-md border transition-all flex items-center justify-center ${
                  LEVEL_COLORS[Math.min(day.level, 4)]
                } ${
                  day.isToday
                    ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-900'
                    : ''
                } ${isSelected ? 'scale-110 ring-2 ring-white' : 'active:scale-95'}`}
                aria-label={`${day.date}: ${day.count} commits`}
              >
                <span className="text-[8px] font-bold text-zinc-200">
                  {day.count > 0 ? day.count : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 90-Day View */}
      {range === '90' && (
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
          {days30or90.map((day) => {
            const isSelected = selectedDay?.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-sm border transition-all ${
                  LEVEL_COLORS[Math.min(day.level, 4)]
                } ${day.isToday ? 'ring-1 ring-emerald-400' : ''} ${
                  isSelected ? 'scale-125 ring-2 ring-white z-10' : 'active:scale-95'
                }`}
                aria-label={`${day.date}: ${day.count} commits`}
              />
            );
          })}
        </div>
      )}

      {/* Full-Year (52 Weeks Horizontal Scroll) */}
      {range === 'year' && (
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700"
        >
          <div className="inline-flex flex-col space-y-1">
            {/* Week Matrix Columns */}
            <div className="flex gap-1">
              {data?.yearWeeks?.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                  {week.days.map((day) => {
                    const isSelected = selectedDay?.date === day.date;
                    if (day.isFuture) {
                      return (
                        <div
                          key={day.date}
                          className="w-3 h-3 rounded-xs bg-zinc-950/40 border border-zinc-900/60"
                        />
                      );
                    }
                    return (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDay(day)}
                        className={`w-3 h-3 rounded-xs border transition-all ${
                          LEVEL_COLORS[Math.min(day.level, 4)]
                        } ${day.isToday ? 'ring-1 ring-emerald-400' : ''} ${
                          isSelected ? 'scale-125 ring-2 ring-white z-10' : ''
                        }`}
                        aria-label={`${day.date}: ${day.count} contributions`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Month Labels */}
            <div className="flex gap-1 text-[9px] text-zinc-500 font-mono">
              {data?.yearWeeks?.map((week, wIdx) => (
                <div key={wIdx} className="w-3 shrink-0 overflow-visible">
                  {week.monthLabel && <span>{week.monthLabel}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          {LEVEL_COLORS.map((c, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-xs border ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
