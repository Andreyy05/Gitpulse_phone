import {
  ContributionDay,
  DayDistributionItem,
  ExtendedStats,
  GitPulseData,
  HistoryTimelineDay,
  PushEventItem,
  RepositoryItem,
  YearWeek,
} from '@/types';

export function formatLocalDateKey(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calculateHeatmapLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3; // 6+ commits
}

interface ParsedDayInfo {
  date: string;
  count: number;
  level: number;
  tip?: string;
}

export async function fetchContributionsCalendar(
  username: string
): Promise<Record<string, ParsedDayInfo>> {
  const daysMap: Record<string, ParsedDayInfo> = {};

  try {
    const res = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.warn(`[GitHub Fetch] Contributions returned status ${res.status}`);
      return daysMap;
    }

    const html = await res.text();

    const tooltips: Record<string, string> = {};
    const tipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/gi;
    let tipMatch: RegExpExecArray | null;
    while ((tipMatch = tipRegex.exec(html)) !== null) {
      tooltips[tipMatch[1]] = tipMatch[2].trim();
    }

    const tdRegex =
      /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d+)"[^>]*>/gi;
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(html)) !== null) {
      const date = tdMatch[1];
      const id = tdMatch[2];
      const rawLevel = parseInt(tdMatch[3], 10);
      const tipText = tooltips[id] || '';

      let count = 0;
      const countMatch = tipText.match(/^(\d+)\s+contribution/i);
      if (countMatch) {
        count = parseInt(countMatch[1], 10);
      } else if (rawLevel > 0) {
        count = rawLevel === 1 ? 1 : rawLevel === 2 ? 3 : rawLevel === 3 ? 6 : 10;
      }

      daysMap[date] = {
        date,
        count,
        level: Math.min(calculateHeatmapLevel(count), 3),
        tip: tipText,
      };
    }

    if (Object.keys(daysMap).length === 0) {
      const altRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"/gi;
      let altMatch: RegExpExecArray | null;
      while ((altMatch = altRegex.exec(html)) !== null) {
        const date = altMatch[1];
        const count = parseInt(altMatch[2], 10);
        daysMap[date] = {
          date,
          count,
          level: calculateHeatmapLevel(count),
        };
      }
    }
  } catch (err) {
    console.warn('[GitHub Fetch] HTML parsing error:', err);
  }

  return daysMap;
}

export async function fetchGraphQLContributions(
  username: string,
  token: string
): Promise<{ daysMap: Record<string, ParsedDayInfo>; avatarUrl?: string } | null> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        avatarUrl
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitPulse-Mobile-PWA',
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    interface GraphQLResponse {
      data?: {
        user?: {
          avatarUrl: string;
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks: Array<{
                contributionDays: Array<{
                  date: string;
                  contributionCount: number;
                  contributionLevel: string;
                }>;
              }>;
            };
          };
        };
      };
    }

    const json: GraphQLResponse = await res.json();
    const user = json.data?.user;
    if (!user || !user.contributionsCollection?.contributionCalendar) {
      return null;
    }

    const daysMap: Record<string, ParsedDayInfo> = {};
    const weeks = user.contributionsCollection.contributionCalendar.weeks;

    for (const week of weeks) {
      for (const day of week.contributionDays) {
        daysMap[day.date] = {
          date: day.date,
          count: day.contributionCount,
          level: calculateHeatmapLevel(day.contributionCount),
          tip: `${day.contributionCount} contributions on ${day.date}`,
        };
      }
    }

    return {
      daysMap,
      avatarUrl: user.avatarUrl,
    };
  } catch (err) {
    console.warn('[GitHub Fetch] GraphQL error, falling back:', err);
    return null;
  }
}

export async function fetchUserRepositories(
  username: string,
  token?: string
): Promise<RepositoryItem[]> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitPulse-Mobile-PWA',
    };
    if (token && token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=12`;
    const res = await fetch(endpoint, { headers, next: { revalidate: 60 } });

    if (res.ok) {
      interface RawRepo {
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        private: boolean;
        pushed_at?: string;
        updated_at?: string;
      }
      const data: RawRepo[] = await res.json();
      if (Array.isArray(data)) {
        return data.map((r) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          url: r.html_url,
          description: r.description || '',
          language: r.language || 'Code',
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          isPrivate: !!r.private,
          updatedAt: r.pushed_at || r.updated_at || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn('[GitHub Fetch] Repos error:', err);
  }
  return [];
}

interface RawGitHubEvent {
  id: string;
  type: string;
  actor?: { avatar_url?: string };
  repo?: { name: string };
  created_at: string;
  payload?: {
    size?: number;
    distinct_size?: number;
    commits?: Array<{
      message: string;
      timestamp?: string;
      author?: { date?: string };
    }>;
  };
}

export async function fetchUserEvents(
  username: string,
  token?: string
): Promise<RawGitHubEvent[]> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitPulse-Mobile-PWA',
    };
    if (token && token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100`;
    const res = await fetch(endpoint, { headers, next: { revalidate: 30 } });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? (data as RawGitHubEvent[]) : [];
    }
  } catch (err) {
    console.warn('[GitHub Fetch] Events error:', err);
  }
  return [];
}

export function calculateStreaks(
  calendarMap: Record<string, ParsedDayInfo>,
  pushCountsByDate: Record<string, number>,
  todayKey: string
): { currentStreak: number; bestStreak: number } {
  const getCount = (dateKey: string): number => {
    const cal = calendarMap[dateKey];
    const push = pushCountsByDate[dateKey] || 0;
    if (cal && cal.count !== undefined) return Math.max(cal.count, push);
    return push;
  };

  let currentStreak = 0;
  const todayDate = new Date();
  const todayHasCommit = getCount(todayKey) > 0;

  for (let i = todayHasCommit ? 0 : 1; i <= 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const dk = formatLocalDateKey(d);
    if (getCount(dk) > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const allDates = Object.keys(calendarMap).sort();
  let bestStreak = 0;
  let runningBest = 0;
  let prevDate: string | null = null;

  for (const dk of allDates) {
    const count = getCount(dk);
    if (count > 0) {
      if (prevDate) {
        const prev = new Date(prevDate);
        const curr = new Date(dk);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningBest++;
        } else {
          runningBest = 1;
        }
      } else {
        runningBest = 1;
      }
      bestStreak = Math.max(bestStreak, runningBest);
      prevDate = dk;
    } else {
      runningBest = 0;
      prevDate = dk;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);
  return { currentStreak, bestStreak };
}

export function calculateExtendedStats(
  calendarMap: Record<string, ParsedDayInfo>,
  pushCountsByDate: Record<string, number>,
  pushEvents: RawGitHubEvent[],
  todayKey: string
): ExtendedStats {
  const getCount = (dateKey: string): number => {
    const cal = calendarMap[dateKey];
    const push = pushCountsByDate[dateKey] || 0;
    if (cal && cal.count !== undefined) return Math.max(cal.count, push);
    return push;
  };

  const today = new Date();
  let commits30Days = 0;
  let commits90Days = 0;

  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dk = formatLocalDateKey(d);
    const count = getCount(dk);
    if (i < 30) {
      commits30Days += count;
    }
    commits90Days += count;
  }

  const dailyAverage = (commits30Days / 30).toFixed(1);
  const dailyAverage90 = (commits90Days / 90).toFixed(1);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayFullNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const daySums = [0, 0, 0, 0, 0, 0, 0];

  const allDates = Object.keys(calendarMap);
  for (const dk of allDates) {
    const count = getCount(dk);
    if (count > 0) {
      const [y, m, d] = dk.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayIdx = dateObj.getDay();
      daySums[dayIdx] += count;
    }
  }

  let maxDayIdx = 1; // default Monday
  let maxDayCount = -1;
  let totalAllDays = 0;

  for (let i = 0; i < 7; i++) {
    totalAllDays += daySums[i];
    if (daySums[i] > maxDayCount) {
      maxDayCount = daySums[i];
      maxDayIdx = i;
    }
  }

  const mostActiveDay = {
    name: dayFullNames[maxDayIdx],
    short: dayNames[maxDayIdx],
    count: Math.max(0, maxDayCount),
    percentage: totalAllDays > 0 ? Math.round((maxDayCount / totalAllDays) * 100) : 0,
  };

  const displayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun
  const maxInOrder = Math.max(1, ...daySums);
  const dayDistribution: DayDistributionItem[] = displayOrder.map((idx) => ({
    name: dayNames[idx],
    fullName: dayFullNames[idx],
    count: daySums[idx],
    percentOfMax: Math.round((daySums[idx] / maxInOrder) * 100),
    isMax: idx === maxDayIdx,
  }));

  const repoMap: Record<string, { name: string; commits: number; pushes: number; url: string }> =
    {};
  for (const event of pushEvents) {
    const rName = event.repo?.name;
    if (!rName) continue;
    const commitCount =
      Array.isArray(event.payload?.commits) && event.payload.commits.length > 0
        ? event.payload.commits.length
        : event.payload?.size || 1;

    if (!repoMap[rName]) {
      repoMap[rName] = {
        name: rName,
        commits: 0,
        pushes: 0,
        url: `https://github.com/${rName}`,
      };
    }
    repoMap[rName].commits += commitCount;
    repoMap[rName].pushes += 1;
  }

  const sortedRepos = Object.values(repoMap).sort((a, b) => b.commits - a.commits);
  const mostActiveRepo = sortedRepos[0] || null;

  // 52-week full year calendar
  const currentDayOfWeek = today.getDay();
  const daysUntilSaturday = 6 - currentDayOfWeek;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilSaturday);

  const totalWeeks = 52;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (totalWeeks * 7 - 1));

  const yearWeeks: YearWeek[] = [];
  let currentWeekDays: ContributionDay[] = [];
  let totalYearContributions = 0;
  const monthAbbrs = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let prevMonth: string | null = null;

  const walker = new Date(startDate);
  while (walker <= endDate) {
    const dk = formatLocalDateKey(walker);
    const count = getCount(dk);
    const cal = calendarMap[dk];
    const isFuture = walker > today;
    const level = isFuture
      ? -1
      : cal && cal.level !== undefined
      ? cal.level
      : calculateHeatmapLevel(count);

    if (!isFuture) {
      totalYearContributions += count;
    }

    currentWeekDays.push({
      date: dk,
      count: isFuture ? 0 : count,
      level: Math.min(Math.max(level, 0), 3),
      isToday: dk === todayKey,
      isFuture,
      dayOfWeek: walker.getDay(),
      tip: `${count} contributions on ${dk}`,
    });

    if (currentWeekDays.length === 7) {
      const firstDate = new Date(currentWeekDays[0].date);
      const mIdx = firstDate.getMonth();
      const mStr = monthAbbrs[mIdx];
      let monthLabel: string | null = null;
      if (mStr !== prevMonth) {
        monthLabel = mStr;
        prevMonth = mStr;
      }

      yearWeeks.push({
        days: currentWeekDays,
        monthLabel,
      });
      currentWeekDays = [];
    }

    walker.setDate(walker.getDate() + 1);
  }

  return {
    commits30Days,
    commits90Days,
    dailyAverage,
    dailyAverage90,
    mostActiveDay,
    dayDistribution,
    mostActiveRepo,
    yearWeeks,
    totalYearContributions,
  };
}

export async function fetchFullGitHubData(
  username: string,
  token?: string
): Promise<GitPulseData> {
  const cleanUser = username.trim();
  if (!cleanUser) {
    throw new Error('GitHub username is required.');
  }

  let avatarUrl = `https://avatars.githubusercontent.com/${cleanUser}`;
  let calendarMap: Record<string, ParsedDayInfo> = {};

  if (token && token.trim()) {
    const gql = await fetchGraphQLContributions(cleanUser, token);
    if (gql) {
      calendarMap = gql.daysMap;
      if (gql.avatarUrl) avatarUrl = gql.avatarUrl;
    }
  }

  if (Object.keys(calendarMap).length === 0) {
    calendarMap = await fetchContributionsCalendar(cleanUser);
  }

  const [rawEventsList, repositories] = await Promise.all([
    fetchUserEvents(cleanUser, token),
    fetchUserRepositories(cleanUser, token),
  ]);

  const pushEvents = rawEventsList.filter((e) => e.type === 'PushEvent');

  if (
    rawEventsList[0]?.actor?.avatar_url &&
    avatarUrl.includes(`avatars.githubusercontent.com/${cleanUser}`)
  ) {
    avatarUrl = rawEventsList[0].actor.avatar_url;
  }

  const pushCountsByDate: Record<string, number> = {};
  const recentPushes: PushEventItem[] = [];
  const todayKey = formatLocalDateKey(new Date());

  for (const event of pushEvents) {
    const commits = event.payload?.commits;
    const eventDateKey = formatLocalDateKey(event.created_at);

    if (Array.isArray(commits) && commits.length > 0) {
      for (const commit of commits) {
        const commitDateRaw = commit.timestamp || commit.author?.date || event.created_at;
        const commitDateKey = formatLocalDateKey(commitDateRaw);
        pushCountsByDate[commitDateKey] = (pushCountsByDate[commitDateKey] || 0) + 1;
      }
    } else {
      const size = event.payload?.size || event.payload?.distinct_size || 1;
      pushCountsByDate[eventDateKey] = (pushCountsByDate[eventDateKey] || 0) + size;
    }

    if (eventDateKey === todayKey) {
      const eventDate = new Date(event.created_at);
      const repoName = event.repo?.name || 'unknown/repo';
      const commitCount =
        Array.isArray(commits) && commits.length > 0
          ? commits.length
          : event.payload?.size || 1;
      const latestMessage =
        commits?.[0]?.message?.split('\n')[0] ||
        (commitCount > 1 ? `${commitCount} commits` : 'Code push');

      recentPushes.push({
        id: String(event.id),
        repo: repoName,
        repoUrl: `https://github.com/${repoName}`,
        commitCount,
        latestMessage,
        time: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: eventDate.getTime(),
      });
    }
  }

  // 14-day timeline
  const days: HistoryTimelineDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = formatLocalDateKey(d);

    const calDay = calendarMap[dateKey];
    const pushCount = pushCountsByDate[dateKey] || 0;

    const count =
      calDay && calDay.count !== undefined
        ? Math.max(calDay.count, pushCount)
        : pushCount;

    const level =
      calDay && calDay.level !== undefined
        ? calDay.level
        : calculateHeatmapLevel(count);

    days.push({
      date: dateKey,
      count,
      level: Math.min(Math.max(level, calculateHeatmapLevel(count)), 3),
      isToday: i === 0,
    });
  }

  const todayCommits = days[13]?.count || 0;
  const totalCommits = days.reduce((acc, curr) => acc + curr.count, 0);

  const { currentStreak, bestStreak } = calculateStreaks(
    calendarMap,
    pushCountsByDate,
    todayKey
  );

  const stats = calculateExtendedStats(
    calendarMap,
    pushCountsByDate,
    pushEvents,
    todayKey
  );

  recentPushes.sort((a, b) => b.timestamp - a.timestamp);
  const lastPush = recentPushes.length > 0 ? recentPushes[0] : null;

  return {
    username: cleanUser,
    avatarUrl,
    hasPushedToday: todayCommits > 0,
    totalCommitsToday: todayCommits,
    totalPushEventsToday: recentPushes.length || (todayCommits > 0 ? 1 : 0),
    lastPushTime: lastPush ? lastPush.time : todayCommits > 0 ? 'Today' : null,
    recentPushes: recentPushes.slice(0, 5),
    history14Days: days,
    total14DaysCommits: totalCommits,
    yearWeeks: stats.yearWeeks,
    totalYearContributions: stats.totalYearContributions,
    currentStreak,
    bestStreak,
    stats,
    repositories,
    isOffline: false,
    offlineReason: null,
    rateLimitWarning: null,
    updatedAt: new Date().toISOString(),
  };
}
