'use client';

import React from 'react';
import { GitCommit, GitBranch, ExternalLink, Clock } from 'lucide-react';
import { PushEventItem } from '@/types';

interface RecentActivityFeedProps {
  pushes: PushEventItem[];
  hasPushedToday: boolean;
}

export function RecentActivityFeed({ pushes, hasPushedToday }: RecentActivityFeedProps) {
  if (!pushes || pushes.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 text-center space-y-2">
        <GitBranch size={24} className="mx-auto text-zinc-600" />
        <p className="text-sm font-medium text-zinc-300">No pushes today yet</p>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          Commit and push your work to any GitHub repository to safeguard your streak and view live activity.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <GitCommit size={15} className="text-emerald-400" />
          <span>Today&apos;s Activity ({pushes.length})</span>
        </div>
        <span className="text-[11px] text-zinc-500">Latest pushes</span>
      </div>

      <div className="space-y-2.5">
        {pushes.map((p) => (
          <a
            key={p.id}
            href={p.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="block p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-950 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-zinc-200 group-hover:text-emerald-400 truncate max-w-[220px]">
                {p.repo}
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center space-x-1 shrink-0">
                <Clock size={11} />
                <span>{p.time}</span>
              </span>
            </div>

            <p className="text-xs text-zinc-400 truncate font-mono">
              {p.latestMessage}
            </p>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400/90 font-medium">
                {p.commitCount} {p.commitCount === 1 ? 'commit' : 'commits'}
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-300 flex items-center space-x-1">
                <span>View repo</span>
                <ExternalLink size={10} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
