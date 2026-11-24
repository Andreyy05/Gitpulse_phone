'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Copy, Check, Dices, RotateCcw } from 'lucide-react';
import { getRandomCommit } from '@/lib/commitFuel';

const CATEGORIES = [
  { id: 'mix', label: 'Mix' },
  { id: 'clean', label: 'Clean' },
  { id: 'witty', label: 'Witty' },
  { id: 'docs', label: 'Docs' },
  { id: 'hotfix', label: 'Hotfix' },
];

export function CommitFuel() {
  const [category, setCategory] = useState('mix');
  const [generatedMessage, setGeneratedMessage] = useState(() =>
    getRandomCommit('mix')
  );
  const [editedMessage, setEditedMessage] = useState(() =>
    getRandomCommit('mix')
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditedMessage(generatedMessage);
    }
  }, [generatedMessage, isEditing]);

  const handleRoll = () => {
    setIsRolling(true);
    setIsEditing(false);
    setTimeout(() => {
      const next = getRandomCommit(category);
      setGeneratedMessage(next);
      setEditedMessage(next);
      setIsRolling(false);
    }, 150);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setIsEditing(false);
    const next = getRandomCommit(newCat);
    setGeneratedMessage(next);
    setEditedMessage(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const isModified = isEditing && editedMessage !== generatedMessage;
  const charCount = editedMessage.length;
  const isOverRecommended = charCount > 72;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-sm flex flex-col space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-zinc-200 tracking-tight">
          <Flame size={14} className="text-amber-400" />
          <span>Commit Fuel</span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs tracking-tight transition-all whitespace-nowrap font-medium ${
                category === cat.id
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editable Message Box */}
      <div className="relative group bg-black/20 border border-white/[0.06] rounded-xl p-3 sm:p-4 transition-all">
        <textarea
          rows={2}
          value={editedMessage}
          onChange={(e) => {
            setIsEditing(true);
            setEditedMessage(e.target.value);
          }}
          className="w-full bg-transparent text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
          placeholder="Generate or write commit message..."
        />

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-zinc-500">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRoll}
              className={`p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center space-x-1 text-xs ${
                isRolling ? 'rotate-180 duration-300' : ''
              }`}
              title="Roll another message"
            >
              <Dices size={14} />
              <span>Roll</span>
            </button>

            {isModified && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedMessage(generatedMessage);
                }}
                className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Reset to generated message"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`font-mono text-[10px] ${
                isOverRecommended
                  ? 'text-amber-400 font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              {charCount}/72 chars
            </span>

            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
