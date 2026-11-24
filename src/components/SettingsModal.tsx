'use client';

import React, { useState } from 'react';
import { X, Key, User, Bell, Palette, Clock, Check, Eye, EyeOff } from 'lucide-react';
import { UserSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onClose: () => void;
  onSave: (newSettings: Partial<UserSettings>) => void;
}

export function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [username, setUsername] = useState(settings.username);
  const [token, setToken] = useState(settings.githubToken);
  const [showToken, setShowToken] = useState(false);
  const [interval, setIntervalVal] = useState(settings.refreshInterval);
  const [sound, setSound] = useState(settings.soundEnabled);
  const [theme, setTheme] = useState(settings.theme);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username: username.trim(),
      githubToken: token.trim(),
      refreshInterval: interval,
      soundEnabled: sound,
      theme,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white tracking-tight">
            Settings &amp; Configuration
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-800/60 active:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* GitHub Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <User size={13} className="text-emerald-400" />
              <span>GitHub Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Andreyy05"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* GitHub Token (PAT) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Key size={13} className="text-amber-400" />
                <span>GitHub Personal Access Token (Optional)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 cursor-pointer"
              >
                {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showToken ? 'Hide' : 'Show'}</span>
              </button>
            </label>
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[10px] text-zinc-500">
              Enables private repo streak tracking and increases API rate limit from 60 to 5,000 req/hr. Stored locally on this device.
            </p>
          </div>

          {/* Auto Refresh Interval */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <Clock size={13} className="text-blue-400" />
              <span>Auto-Sync Interval</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setIntervalVal(mins)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    interval === mins
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Sound Celebration */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center space-x-2.5">
              <Bell size={15} className="text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200">
                  Celebration Audio
                </span>
                <span className="text-[10px] text-zinc-500">
                  Plays synth chime when streak is achieved today
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <Palette size={13} className="text-purple-400" />
              <span>Interface Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'dark', label: 'Dark' },
                  { id: 'light', label: 'Light' },
                  { id: 'system', label: 'System' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.98] ${
                savedSuccess
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
