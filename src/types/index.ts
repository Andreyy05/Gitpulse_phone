export interface ContributionDay {
  date: string;
  count: number;
  level: number;
  isToday?: boolean;
  isFuture?: boolean;
  dayOfWeek?: number;
  tip?: string;
}

export interface YearWeek {
  days: ContributionDay[];
  monthLabel: string | null;
}

export interface HistoryTimelineDay {
  date: string;
  count: number;
  level: number;
  isToday: boolean;
}

export interface PushEventItem {
  id: string;
  repo: string;
  repoUrl: string;
  commitCount: number;
  latestMessage: string;
  time: string;
  timestamp: number;
}

export interface RepositoryItem {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  updatedAt: string;
}

export interface DayDistributionItem {
  name: string;
  fullName: string;
  count: number;
  percentOfMax: number;
  isMax: boolean;
}

export interface ExtendedStats {
  commits30Days: number;
  commits90Days: number;
  dailyAverage: string;
  dailyAverage90: string;
  mostActiveDay: {
    name: string;
    short: string;
    count: number;
    percentage: number;
  } | null;
  dayDistribution: DayDistributionItem[];
  mostActiveRepo: {
    name: string;
    commits: number;
    pushes: number;
    url: string;
  } | null;
  yearWeeks: YearWeek[];
  totalYearContributions: number;
}

export interface GitPulseData {
  username: string;
  avatarUrl: string;
  hasPushedToday: boolean;
  totalCommitsToday: number;
  totalPushEventsToday: number;
  lastPushTime: string | null;
  recentPushes: PushEventItem[];
  history14Days: HistoryTimelineDay[];
  total14DaysCommits: number;
  yearWeeks: YearWeek[];
  totalYearContributions: number;
  currentStreak: number;
  bestStreak: number;
  stats: ExtendedStats;
  repositories: RepositoryItem[];
  isOffline?: boolean;
  offlineReason?: string | null;
  rateLimitWarning?: string | null;
  updatedAt: string;
}

export interface UserSettings {
  username: string;
  githubToken: string;
  refreshInterval: number; // in minutes
  soundEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface CountdownInfo {
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isCritical: boolean;
  progressPercent: number;
}
