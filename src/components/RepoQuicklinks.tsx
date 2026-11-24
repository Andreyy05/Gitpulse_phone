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
  Ruby: 'bg-red-500',
  Java: 'bg-amber-600',
  Kotlin: 'bg-violet-500',
  Swift: 'bg-orange-400',
};

export function RepoQuicklinks({
  repositories = [],
  loading,
}: RepoQuicklinksProps) {
  const [pinnedNames, setPinnedNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gitpulse_pinned_repos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  const togglePin = (repoName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  if (!repositories || repositories.length === 0) {
    if (loading) {
      return (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col space-y-3.5 animate-pulse">
          <div className="h-4 w-32 bg-white/[0.06] rounded" />
          <div className="grid grid-cols-1 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-white/[0.03] bg-white/[0.01]"
              />
            ))}
          </div>
        </div>
      );
    }
    return null;
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
      (r.description &&
        r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-sm flex flex-col space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-zinc-200 tracking-tight">
          <Bookmark size={14} className="text-zinc-400" />
          <span>Repositories</span>
        </div>

        <div className="flex items-center space-x-2">
          {pinnedNames.length > 0 && (
            <span className="text-[11px] text-zinc-500 font-medium">
              {pinnedNames.length} pinned
            </span>
          )}
          <span className="text-[11px] text-zinc-500">
            {filteredRepos.length} total
          </span>
        </div>
      </div>

      {/* Live Search Filter */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter repositories..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.06] focus:border-white/[0.15] text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Grid of Repository Cards */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
        {filteredRepos.map((repo) => {
          const isPinned = pinnedNames.includes(repo.name);
          const langColor =
            LANGUAGE_COLORS[repo.language] || 'bg-zinc-400';

          return (
            <a
              key={repo.id}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className={`p-3 rounded-xl border transition-all flex flex-col space-y-2 group block ${
                isPinned
                  ? 'bg-white/[0.04] border-white/[0.12]'
                  : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03]'
              }`}
            >
              {/* Top Row: Name, Lock, Pin button & external link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate max-w-[220px]">
                  {repo.isPrivate && (
                    <Lock size={11} className="text-amber-400 shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 truncate">
                    {repo.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => togglePin(repo.name, e)}
                    className={`p-1 rounded-md transition-colors ${
                      isPinned
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={isPinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin size={12} className={isPinned ? 'fill-amber-400' : ''} />
                  </button>
                  <ExternalLink size={12} className="text-zinc-500 group-hover:text-zinc-300" />
                </div>
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {repo.description}
                </p>
              )}

              {/* Metadata: Language, Stars, Forks */}
              <div className="flex items-center space-x-3 text-[10px] text-zinc-500 pt-0.5">
                <span className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${langColor}`} />
                  <span className="text-zinc-400">{repo.language}</span>
                </span>

                {repo.stars > 0 && (
                  <span className="flex items-center space-x-0.5 text-zinc-400">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span>{repo.stars}</span>
                  </span>
                )}

                {repo.forks > 0 && (
                  <span className="flex items-center space-x-0.5 text-zinc-400">
                    <GitFork size={10} />
                    <span>{repo.forks}</span>
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
