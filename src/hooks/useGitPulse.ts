'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GitPulseData, UserSettings } from '@/types';
import { playCelebrationChime } from '@/lib/audio';

export type TabType = 'pulse' | 'stats' | 'repos' | 'all';

const STORAGE_KEYS = {
  USERNAME: 'gitpulse_username',
  PAT: 'gitpulse_pat',
  INTERVAL: 'gitpulse_refresh_interval',
  SOUND: 'gitpulse_sound_enabled',
  THEME: 'gitpulse_theme',
  TAB: 'gitpulse_active_tab',
  CACHE_PREFIX: 'gitpulse_cached_data_',
};

export function useGitPulse() {
  const [settings, setSettings] = useState<UserSettings>({
    username: 'Andreyy05',
    githubToken: '',
    refreshInterval: 15,
    soundEnabled: true,
    theme: 'dark',
  });

  const [activeTab, setActiveTab] = useState<TabType>('pulse');
  const [data, setData] = useState<GitPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasCelebratedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Andreyy05';
      const savedPat = localStorage.getItem(STORAGE_KEYS.PAT) || '';
      const savedInterval = Number(localStorage.getItem(STORAGE_KEYS.INTERVAL)) || 15;
      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
      const savedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | 'system') || 'dark';
      const savedTab = (localStorage.getItem(STORAGE_KEYS.TAB) as TabType) || 'pulse';

      setSettings({
        username: savedUser,
        githubToken: savedPat,
        refreshInterval: savedInterval,
        soundEnabled: savedSound,
        theme: savedTheme,
      });

      if (['pulse', 'stats', 'repos', 'all'].includes(savedTab)) {
        setActiveTab(savedTab);
      }

      // Local offline cache
      const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${savedUser.toLowerCase()}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw) as GitPulseData;
          setData({ ...parsed, isOffline: !navigator.onLine });
          setLoading(false);
        } catch {}
      }
    } catch (e) {
      console.warn('[useGitPulse] Initial state error:', e);
    }
    initialLoadDoneRef.current = true;
  }, []);

  // Theme application
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const applyTheme = () => {
      let isDark = true;
      if (settings.theme === 'dark') isDark = true;
      else if (settings.theme === 'light') isDark = false;
      else if (settings.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  // Tab change
  const changeTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem(STORAGE_KEYS.TAB, tab);
    } catch {}
  }, []);

  // 1-click theme toggle
  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const isCurrentlyDark =
        prev.theme === 'dark' ||
        (prev.theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      const nextTheme = isCurrentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
      } catch {}
      return { ...prev, theme: nextTheme };
    });
  }, []);

  // Main data loader
  const loadData = useCallback(
    async (isManualRefresh = false, overrideUser?: string, overrideToken?: string) => {
      const user = (overrideUser ?? settings.username).trim();
      const token = overrideToken ?? settings.githubToken;

      if (!user) {
        setError('Please configure your GitHub username in Settings.');
        setLoading(false);
        return;
      }

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!data) {
        setLoading(true);
      }
      setError(null);

      const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${user.toLowerCase()}`;

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const cached = JSON.parse(raw) as GitPulseData;
            setData({
              ...cached,
              isOffline: true,
              offlineReason: 'Offline mode — using cached data',
            });
            setLoading(false);
            setIsRefreshing(false);
            return;
          }
        } catch {}
      }

      try {
        const queryParams = new URLSearchParams({
          username: user,
          t: String(Date.now()),
        });
        if (token) {
          queryParams.set('token', token);
        }

        const res = await fetch(`/api/github?${queryParams.toString()}`, {
          method: 'GET',
          headers: token ? { 'x-github-token': token } : {},
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }

        const result: GitPulseData = await res.json();
        setData(result);
        setError(null);

        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}

        if (result.hasPushedToday && !hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          if (settings.soundEnabled) {
            playCelebrationChime();
          }
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.35 },
            colors: ['#10b981', '#34d399', '#6366f1', '#f59e0b'],
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch activity';
        console.warn('[useGitPulse] Fetch error, falling back to cache:', message);

        let recovered = false;
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const cached = JSON.parse(raw) as GitPulseData;
            setData({
              ...cached,
              isOffline: true,
              offlineReason: `Network error (${message}) — showing cached snapshot`,
            });
            recovered = true;
          }
        } catch {}

        if (!recovered) {
          setError(message);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [settings.username, settings.githubToken, settings.soundEnabled, data]
  );

  useEffect(() => {
    if (settings.username) {
      loadData();
    }
  }, [settings.username, settings.githubToken]);

  useEffect(() => {
    const minutes = Math.max(1, settings.refreshInterval);
    const intervalId = setInterval(() => {
      loadData(false);
    }, minutes * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [settings.refreshInterval, loadData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => loadData(true);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadData]);

  const saveSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          if (newSettings.username !== undefined) {
            localStorage.setItem(STORAGE_KEYS.USERNAME, newSettings.username);
          }
          if (newSettings.githubToken !== undefined) {
            localStorage.setItem(STORAGE_KEYS.PAT, newSettings.githubToken);
          }
          if (newSettings.refreshInterval !== undefined) {
            localStorage.setItem(STORAGE_KEYS.INTERVAL, String(newSettings.refreshInterval));
          }
          if (newSettings.soundEnabled !== undefined) {
            localStorage.setItem(STORAGE_KEYS.SOUND, String(newSettings.soundEnabled));
          }
          if (newSettings.theme !== undefined) {
            localStorage.setItem(STORAGE_KEYS.THEME, newSettings.theme);
          }
        } catch {}

        if (
          newSettings.username !== undefined ||
          newSettings.githubToken !== undefined
        ) {
          loadData(true, newSettings.username, newSettings.githubToken);
        }

        return updated;
      });
    },
    [loadData]
  );

  return {
    settings,
    data,
    loading,
    isRefreshing,
    error,
    activeTab,
    changeTab,
    toggleTheme,
    refresh: () => loadData(true),
    isSettingsOpen,
    setIsSettingsOpen,
    saveSettings,
  };
}
