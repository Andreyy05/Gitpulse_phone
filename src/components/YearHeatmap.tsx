'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { YearWeek } from '@/types';

interface YearHeatmapProps {
  yearWeeks?: YearWeek[];
  totalContributions?: number;
}

export function YearHeatmap({
  yearWeeks = [],
  totalContributions = 0,
}: YearHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToRight = useCallback((behavior: ScrollBehavior = 'auto') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior,
      });
    }
  }, []);

  const scrollToLeft = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: 0,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    scrollToRight('auto');
  }, [yearWeeks, scrollToRight]);

  if (!yearWeeks || yearWeeks.length === 0) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-white/[0.06] flex flex-col space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-1.5 text-zinc-300">
          <CalendarDays size={13} className="text-zinc-400 shrink-0" />
          <span>Full-Year Activity</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-zinc-400 font-medium">
            {hoveredDay ? (
              <span className="text-zinc-200 font-semibold">
                {hoveredDay.date}: {hoveredDay.count}{' '}
                {hoveredDay.count === 1 ? 'commit' : 'commits'}
              </span>
            ) : (
              <span>{totalContributions} contributions</span>
            )}
          </span>

          {/* Quick Scroll Navigation Controls */}
          <div className="flex items-center space-x-0.5 bg-white/[0.04] p-0.5 rounded-md border border-white/[0.05]">
            <button
              onClick={() => scrollToLeft('smooth')}
              title="Scroll to beginning of year"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft size={11} />
            </button>
            <button
              onClick={() => scrollToRight('smooth')}
              title="Jump to current week (Today)"
              className="px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => scrollToRight('smooth')}
              title="Scroll to latest activity"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* 52-Week Matrix Scroll Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700/50"
      >
        <div className="inline-flex flex-col space-y-1">
          <div className="flex gap-1">
            {yearWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                {week.days.map((day) => {
                  let colorClass = 'bg-white/[0.05] border border-white/[0.04]';
                  if (day.level === 1) {
                    colorClass = 'bg-emerald-950/70 border border-emerald-900/60';
                  } else if (day.level === 2) {
                    colorClass = 'bg-emerald-700/70 border border-emerald-600/60';
                  } else if (day.level >= 3) {
                    colorClass = 'bg-emerald-500 border border-emerald-400';
                  }

                  if (day.isFuture) {
                    return (
                      <div
                        key={day.date}
                        className="w-2.5 h-2.5 rounded-[2px] bg-transparent opacity-20"
                      />
                    );
                  }

                  return (
                    <button
                      key={day.date}
                      onClick={() =>
                        setHoveredDay(
                          hoveredDay?.date === day.date ? null : day
                        )
                      }
                      title={`${day.date}: ${day.count} contributions`}
                      className={`w-2.5 h-2.5 rounded-[2px] border transition-all ${colorClass} ${
                        day.isToday
                          ? 'border-white/60 ring-1 ring-white/40'
                          : ''
                      } ${
                        hoveredDay?.date === day.date
                          ? 'scale-125 ring-2 ring-white z-10'
                          : ''
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Month Labels */}
          <div className="flex gap-1 text-[9px] text-zinc-500 font-mono">
            {yearWeeks.map((week, wIdx) => (
              <div key={wIdx} className="w-2.5 shrink-0 overflow-visible">
                {week.monthLabel && <span>{week.monthLabel}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
