'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Star, GitFork, ExternalLink, Pin, Search, Lock } from 'lucide-react';
import { RepositoryItem } from '@/types';

interface RepoQuicklinksProps {
  repositories?: RepositoryItem[];
  loading: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-500',
  Rust: 'bg-orange-500',
  Python: 'bg-blue-400',
  Go: 'bg-cyan-500',
  'C++': 'bg-pink-600',
  C: 'bg-zinc-400',
  HTML: 'bg-orange-600',
  CSS: 'bg-indigo-500',
  Shell: 'bg-emerald-500',
  Swift: 'bg-orange-400',
  Kotlin: 'bg-violet-500',
};

export function RepoQuicklinks({ repositories = [], loading }: RepoQuicklinksProps) {
  const [pinnedNames, setPinnedNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gitpulse_pinned_repos');
      if (saved) setPinnedNames(JSON.parse(saved));
    } catch {}
  }, []);

  const togglePin = (repoName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedNames((prev) => {
      const next = prev.includes(repoName)
        ? prev.filter((n) => n !== repoName)
        : [...prev, repoName];
      try {
        localStorage.setItem('gitpulse_pinned_repos', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  if (loading && (!repositories || repositories.length === 0)) {
    return (
      <div className="w-full rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3 animate-pulse">
        <div className="h-6 w-32 bg-zinc-800 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const sortedRepos = [...repositories].sort((a, b) => {
    const aPinned = pinnedNames.includes(a.name);
    const bPinned = pinnedNames.includes(b.name);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredRepos = sortedRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <Bookmark size={15} className="text-emerald-400" />
          <span>Repositories ({repositories.length})</span>
        </div>
        {pinnedNames.length > 0 && (
          <span className="text-[11px] text-zinc-400">
            {pinnedNames.length} pinned
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter repositories..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
      </div>

      {/* Repositories List */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5">
        {filteredRepos.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            No repositories matched &ldquo;{searchQuery}&rdquo;
          </p>
        ) : (
          filteredRepos.map((r) => {
            const isPinned = pinnedNames.includes(r.name);
            const langDotColor =
              LANGUAGE_COLORS[r.language] || 'bg-zinc-400';

            return (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className={`block p-3 rounded-xl border transition-all active:scale-[0.99] group ${
                  isPinned
                    ? 'bg-zinc-950/80 border-emerald-500/30'
                    : 'bg-zinc-950/50 border-zinc-800/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 truncate max-w-[220px]">
                    {r.isPrivate && (
                      <Lock size={11} className="text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                      {r.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => togglePin(r.name, e)}
                      className={`p-1 rounded-md transition-colors ${
                        isPinned
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                      title={isPinned ? 'Unpin' : 'Pin to top'}
                      aria-label="Pin repository"
                    >
                      <Pin size={13} className={isPinned ? 'fill-emerald-400' : ''} />
                    </button>
                    <ExternalLink size={12} className="text-zinc-500 group-hover:text-zinc-300" />
                  </div>
                </div>

                {r.description && (
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2">
                    {r.description}
                  </p>
                )}

                <div className="flex items-center space-x-3 text-[10px] text-zinc-400">
                  <span className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${langDotColor}`} />
                    <span>{r.language}</span>
                  </span>

                  {r.stars > 0 && (
                    <span className="flex items-center space-x-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span>{r.stars}</span>
                    </span>
                  )}

                  {r.forks > 0 && (
                    <span className="flex items-center space-x-0.5">
                      <GitFork size={10} />
                      <span>{r.forks}</span>
                    </span>
                  )}
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
