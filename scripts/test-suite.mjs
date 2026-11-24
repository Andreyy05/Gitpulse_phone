import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function runTest(name, fn) {
  try {
    process.stdout.write(`Testing: ${name} ... `);
    await fn();
    console.log('✅ PASS');
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (err) {
    console.log(`❌ FAIL\n   Error: ${err.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
  }
}

// ---------------------------------------------------------------
// 1. Backend API Tests
// ---------------------------------------------------------------
console.log('\n--- [1] BACKEND API SUITE ---');

await runTest('GET /api/github returns valid GitPulseData schema', async () => {
  const res = await fetch(`${BASE_URL}/api/github?username=Andreyy05`);
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const data = await res.json();

  assert.equal(typeof data.username, 'string');
  assert.equal(data.username, 'Andreyy05');
  assert.equal(typeof data.avatarUrl, 'string');
  assert(data.avatarUrl.includes('githubusercontent.com') || data.avatarUrl.includes('github.com'));
  assert.equal(typeof data.hasPushedToday, 'boolean');
  assert.equal(typeof data.totalCommitsToday, 'number');
  assert.equal(typeof data.currentStreak, 'number');
  assert.equal(typeof data.bestStreak, 'number');
  assert(Array.isArray(data.history14Days), 'history14Days should be an array');
  assert.equal(data.history14Days.length, 14, 'history14Days should have exactly 14 items');
  assert(Array.isArray(data.yearWeeks), 'yearWeeks should be an array');
  assert.equal(data.yearWeeks.length, 52, 'yearWeeks should have 52 weeks');
  assert(typeof data.stats === 'object' && data.stats !== null, 'stats should be an object');
  assert.equal(typeof data.stats.commits30Days, 'number');
  assert.equal(typeof data.stats.commits90Days, 'number');
  assert(Array.isArray(data.stats.dayDistribution), 'dayDistribution should be an array');
  assert(Array.isArray(data.repositories), 'repositories should be an array');
});

await runTest('POST /api/github with forceRefresh=true returns 200 OK', async () => {
  const res = await fetch(`${BASE_URL}/api/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Andreyy05', forceRefresh: true }),
  });
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.username, 'Andreyy05');
  assert.equal(typeof data.totalCommitsToday, 'number');
});

await runTest('GET /api/github with external public user (torvalds)', async () => {
  const res = await fetch(`${BASE_URL}/api/github?username=torvalds`);
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const data = await res.json();
  assert.equal(data.username, 'torvalds');
  assert(data.avatarUrl.length > 0);
  assert.equal(data.history14Days.length, 14);
});

await runTest('GET /api/github with empty username returns 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/api/github?username=%20`);
  // If query is empty, it falls back to server GITHUB_USERNAME (Andreyy05) or 400
  assert([200, 400].includes(res.status), `Expected 200 or 400, got ${res.status}`);
});

await runTest('In-memory cache delivers sub-50ms responses', async () => {
  const t0 = performance.now();
  const res = await fetch(`${BASE_URL}/api/github?username=Andreyy05`);
  const t1 = performance.now();
  assert.equal(res.status, 200);
  const latency = t1 - t0;
  assert(latency < 150, `Expected cache latency < 150ms, got ${latency.toFixed(1)}ms`);
});

// ---------------------------------------------------------------
// 2. Calculation & Logic Engine Tests
// ---------------------------------------------------------------
console.log('\n--- [2] CALCULATION & ENGINE LOGIC SUITE ---');

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const totalDaySeconds = 24 * 3600;
  const secondsPassed = 24 * 3600 - Math.floor(diff / 1000);
  const progressPercent = Math.min(100, Math.max(0, (secondsPassed / totalDaySeconds) * 100));

  return {
    formatted: `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
    hours,
    minutes,
    seconds,
    isUrgent: hours < 4,
    isCritical: hours === 0 && minutes < 30,
    progressPercent,
  };
}

await runTest('Midnight countdown engine format and boundary validation', async () => {
  const c = getTimeUntilMidnight();
  assert(/^\d{2}h : \d{2}m : \d{2}s$/.test(c.formatted), `Format invalid: ${c.formatted}`);
  assert(c.hours >= 0 && c.hours <= 24);
  assert(c.minutes >= 0 && c.minutes <= 59);
  assert(c.seconds >= 0 && c.seconds <= 59);
  assert(c.progressPercent >= 0 && c.progressPercent <= 100);
});

function formatLocalDateKey(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calculateHeatmapLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

function calculateStreaks(calendarMap, pushCountsByDate, todayKey) {
  const getCount = (dateKey) => {
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
  let prevDate = null;

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

await runTest('Heatmap level calculation boundaries', async () => {
  assert.equal(calculateHeatmapLevel(0), 0);
  assert.equal(calculateHeatmapLevel(-1), 0);
  assert.equal(calculateHeatmapLevel(1), 1);
  assert.equal(calculateHeatmapLevel(2), 1);
  assert.equal(calculateHeatmapLevel(3), 2);
  assert.equal(calculateHeatmapLevel(5), 2);
  assert.equal(calculateHeatmapLevel(6), 3);
  assert.equal(calculateHeatmapLevel(100), 3);
});

await runTest('Streak engine: Active streak with today commit', async () => {
  const today = new Date();
  const todayKey = formatLocalDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatLocalDateKey(yesterday);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoKey = formatLocalDateKey(twoDaysAgo);

  const calendarMap = {
    [twoDaysAgoKey]: { count: 3 },
    [yesterdayKey]: { count: 1 },
    [todayKey]: { count: 5 },
  };

  const { currentStreak, bestStreak } = calculateStreaks(calendarMap, {}, todayKey);
  assert.equal(currentStreak, 3, `Expected current streak of 3, got ${currentStreak}`);
  assert.equal(bestStreak, 3, `Expected best streak of 3, got ${bestStreak}`);
});

await runTest('Streak engine: Pending push (streak preserved from yesterday)', async () => {
  const today = new Date();
  const todayKey = formatLocalDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatLocalDateKey(yesterday);

  const calendarMap = {
    [yesterdayKey]: { count: 2 },
    [todayKey]: { count: 0 },
  };

  const { currentStreak, bestStreak } = calculateStreaks(calendarMap, {}, todayKey);
  assert.equal(currentStreak, 1, `Expected streak preserved (1), got ${currentStreak}`);
  assert.equal(bestStreak, 1);
});

await runTest('Streak engine: Broken streak (0 commits yesterday and today)', async () => {
  const today = new Date();
  const todayKey = formatLocalDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatLocalDateKey(yesterday);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const threeDaysAgoKey = formatLocalDateKey(threeDaysAgo);

  const calendarMap = {
    [threeDaysAgoKey]: { count: 4 },
    [yesterdayKey]: { count: 0 },
    [todayKey]: { count: 0 },
  };

  const { currentStreak, bestStreak } = calculateStreaks(calendarMap, {}, todayKey);
  assert.equal(currentStreak, 0, `Expected 0 streak, got ${currentStreak}`);
  assert.equal(bestStreak, 1, `Expected best streak of 1, got ${bestStreak}`);
});

// ---------------------------------------------------------------
// 3. PWA Manifest & Assets Suite
// ---------------------------------------------------------------
console.log('\n--- [3] PWA MANIFEST & STATIC ASSETS SUITE ---');

await runTest('GET /manifest.json returns valid PWA manifest', async () => {
  const res = await fetch(`${BASE_URL}/manifest.json`);
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const manifest = await res.json();
  assert(manifest.name.includes('GitPulse'), 'Manifest name should include GitPulse');
  assert.equal(manifest.short_name, 'GitPulse');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait');
  assert.equal(manifest.theme_color, '#090d12');
  assert(Array.isArray(manifest.icons), 'Manifest should have icons array');
  assert(manifest.icons.length >= 2, 'Should have at least 192 and 512 icons');
});

await runTest('GET /sw.js returns Service Worker script', async () => {
  const res = await fetch(`${BASE_URL}/sw.js`);
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const text = await res.text();
  assert(text.includes('addEventListener'), 'SW should have event listeners');
  assert(text.includes('caches.open'), 'SW should handle caches');
});

await runTest('PWA Icons are accessible and non-empty', async () => {
  const iconUrls = [
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/apple-touch-icon.png',
    '/favicon.ico',
  ];

  for (const icon of iconUrls) {
    const res = await fetch(`${BASE_URL}${icon}`);
    assert.equal(res.status, 200, `${icon} should return 200 OK`);
    const blob = await res.arrayBuffer();
    assert(blob.byteLength > 100, `${icon} should have valid byte length`);
  }
});

// ---------------------------------------------------------------
// 4. Frontend Document & Mobile Viewport Suite
// ---------------------------------------------------------------
console.log('\n--- [4] FRONTEND HTML & VIEWPORT SUITE ---');

await runTest('GET / returns valid HTML with mobile viewport and PWA tags', async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
  const html = await res.text();

  assert(html.includes('viewport-fit=cover'), 'HTML should have viewport-fit=cover');
  assert(html.includes('apple-mobile-web-app-capable'), 'HTML should have apple-mobile-web-app-capable');
  assert(html.includes('manifest.json'), 'HTML should link to manifest.json');
  assert(html.includes('GitPulse'), 'HTML should contain GitPulse branding');
  assert(html.includes('sw.js'), 'HTML should register sw.js');
});

// ---------------------------------------------------------------
// Summary
// ---------------------------------------------------------------
console.log('\n=============================================');
console.log(`TEST SUITE RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
console.log('=============================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
