'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { getRandomCommit } from '@/lib/commitFuel';

export function CommitFuelCard() {
  const [category, setCategory] = useState<'mix' | 'conventional' | 'witty' | 'docs' | 'hotfix'>('mix');
  const [message, setMessage] = useState(() => getRandomCommit('mix'));
  const [copied, setCopied] = useState(false);

  const generateNew = () => {
    setMessage(getRandomCommit(category));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const charCount = message.length;
  const isOverRecommended = charCount > 72;

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-semibold text-sm">
          <Sparkles size={15} className="text-amber-400" />
          <span>Commit Fuel Generator</span>
        </div>

        <button
          onClick={generateNew}
          className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded-lg bg-emerald-500/10 active:scale-95 transition-all"
        >
          <RefreshCw size={12} />
          <span>New Fuel</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: 'mix', label: 'Mix' },
            { id: 'conventional', label: 'Conventional' },
            { id: 'witty', label: 'Witty' },
            { id: 'docs', label: 'Docs' },
            { id: 'hotfix', label: 'Hotfix' },
          ] as const
        ).map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategory(c.id);
              setMessage(getRandomCommit(c.id));
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              category === c.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'bg-zinc-950/60 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* In-place Editable Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
        />

        {/* Character gauge pill */}
        <div className="flex items-center justify-between text-[11px] px-1 mt-1 text-zinc-500">
          <span className="text-[10px]">Tap to edit message</span>
          <span
            className={`font-mono text-[10px] ${
              isOverRecommended ? 'text-amber-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            {charCount}/72 chars
          </span>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={copyToClipboard}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
          copied
            ? 'bg-emerald-500 text-zinc-950'
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        {copied ? (
          <>
            <Check size={14} />
            <span>Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span>Copy Commit Message</span>
          </>
        )}
      </button>
    </div>
  );
}
