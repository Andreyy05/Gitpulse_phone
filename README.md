# ⚡ GitPulse Phone (PWA)

<div align="center">
  <p><strong>Mobile-first native Progressive Web App for tracking your daily GitHub commit streaks, contribution heatmaps, and generating conventional commit fuel.</strong></p>
  <p>Engineered with <strong>Next.js 15 (App Router)</strong>, <strong>React 19</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>. Tailored for phone viewports (375px – 430px) and built for zero-config deployment on <strong>Vercel</strong>.</p>

  <br />

  [![Framework: Next.js 15](https://img.shields.io/badge/Framework-Next.js_15.1-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React: 19](https://img.shields.io/badge/React-19.0-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
  [![TypeScript: 5](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS: 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Deployment: Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
  [![PWA: Ready](https://img.shields.io/badge/PWA-iOS_%26_Android-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

  <br /><br />

  <table align="center">
    <tr>
      <td align="center"><strong>🔥 Pulse & Streak Engine</strong></td>
      <td align="center"><strong>🟩 Interactive Heatmap</strong></td>
      <td align="center"><strong>✍️ Commit Fuel & Repos</strong></td>
    </tr>
    <tr>
      <td align="center">
        <code>[ 12-Day Streak ]</code><br />
        <em>Midnight deadline countdown, urgent alerts & audio confetti</em>
      </td>
      <td align="center">
        <code>[ 14d · 30d · 90d · Year ]</code><br />
        <em>52-week yearly matrix, interactive inspection & tooltips</em>
      </td>
      <td align="center">
        <code>[ Conventional Commits ]</code><br />
        <em>72-char gauge, quick copy & pinned repositories</em>
      </td>
    </tr>
  </table>

  <p><em>Add to Home Screen on iOS and Android for an immersive, frameless native mobile experience.</em></p>
</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architectural Benchmarks](#-architectural-benchmarks)
- [Key Capabilities](#-key-capabilities)
  - [1. Real-Time Streak & Deadline Telemetry](#1-real-time-streak--deadline-telemetry)
  - [2. Multi-Range Contribution Heatmap](#2-multi-range-contribution-heatmap)
  - [3. Commit Insights & Weekly Rhythm](#3-commit-insights--weekly-rhythm)
  - [4. Repository Quicklinks Hub](#4-repository-quicklinks-hub)
  - [5. Conventional Commit Fuel Generator](#5-conventional-commit-fuel-generator)
  - [6. Offline Cache Resilience & Zero Token Exposure](#6-offline-cache-resilience--zero-token-exposure)
- [Mobile-First UI & Ergonomics](#-mobile-first-ui--ergonomics)
- [Security & API Architecture](#-security--api-architecture)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [Deployment on Vercel](#-deployment-on-vercel)
- [Installation as PWA on Phone](#-installation-as-pwa-on-phone)
  - [iOS (iPhone / iPad)](#ios-iphone--ipad--safari)
  - [Android](#android-chrome--brave--edge)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 📋 Overview

**GitPulse Phone** is the mobile-first Progressive Web App companion to GitPulse. It empowers developers to monitor their daily GitHub contribution streaks, safeguard their all-time records from anywhere, analyze commit velocity, and spark development momentum with smart commit messages.

Unlike traditional desktop applications or heavy web dashboards that load tens of megabytes of scripts, GitPulse Phone is engineered specifically for smartphones:
- **First Load JS:** Under **125 kB**
- **Cold Startup:** Sub-300ms
- **Zero App Store friction:** Installs instantly via browser standards (Web App Manifest + Service Worker).
- **Offline First:** Fully functional even when in airplane mode or commuting underground.

---

## ⚡ Architectural Benchmarks

| Metric | Heavy Web Dashboard | Native App Store Utility | GitPulse Phone (PWA + Next.js) | Architectural Advantage |
| :--- | :--- | :--- | :--- | :--- |
| **Install Method** | Browser tab only | 80MB+ App Store / Play Store | **Add to Home Screen (PWA)** | Instant, zero-friction install |
| **Initial JS Payload** | ~1.5 MB – 3.5 MB | N/A (compiled binary) | **~123 kB** | **>90% lighter web payload** |
| **Cold Startup Time** | ~2,000 – 4,000 ms | ~400 – 800 ms | **< 300 ms** | Edge-rendered + Service Worker |
| **Data Usage per Sync**| ~200 KB – 500 KB | ~100 KB | **~15 KB – 30 KB** | SWR caching & edge-optimized payload |
| **Token Security** | Client-side exposure risk | Device Keychain | **Server-side Route Handler** | Token never exposed to browser |
| **Offline Operation** | Broken (blank screen) | Partial local storage | **Local Cache + Service Worker** | Complete cached timeline & stats |

---

## 📊 Key Capabilities

### 1. Real-Time Streak & Deadline Telemetry
* **Live Streak Tracker**: Real-time counter of your consecutive contribution streak paired with your all-time personal best record (`🔥 12-day streak · Best: 24d`).
* **Midnight Countdown Engine**: Live high-precision timer displaying hours, minutes, and seconds remaining until midnight in your local timezone.
* **Emergency Push Alert**: Visual pulse and amber/rose warnings when fewer than 4 hours (urgent) or 30 minutes (critical) remain before midnight without detected public pushes.
* **Celebration Audio & Confetti**: Synthesizes pleasant arpeggio chime tones using the **Web Audio API** (zero external MP3 assets) and launches celebration particles upon your first commit of the day.

### 2. Multi-Range Contribution Heatmap
* **Flexible Analysis Ranges**: Toggle seamlessly between:
  * `14d`: High-density 2-row mobile grid with current day highlight ring.
  * `30d`: Last month commit matrix.
  * `90d`: Quarter-year cadence matrix.
  * `Year`: Full 52-week horizontal scrolling matrix auto-anchored to current week activity on the right.
* **Interactive Touch Inspection**: Tap any cell to inspect the exact weekday, formatted date, and commit quantity in a dedicated high-contrast feedback pill.
* **GitHub Dark Green Levels**: Accurately mapped to GitHub's color scales (Level 0 through 4).

### 3. Commit Insights & Weekly Rhythm
* **Analysis Windows**: Toggle between **Last 30 Days** and **Last 90 Days** with instant velocity recomputation.
* **Commit Velocity**: Total commit output paired with daily throughput averages (`commits/day`).
* **Peak Output Day**: Identifies your most productive day of the week along with its percentage share of total activity.
* **Weekly Rhythm Bar Chart**: Visual breakdown from Monday through Sunday highlighting development habits across the week.
* **Top Active Repository**: Automatically detects the repository with the highest volume of pushes and commits.

### 4. Repository Quicklinks Hub
* **Instant Mobile Access**: Access all your personal public and private repositories without navigating to github.com.
* **Live Search Filter**: Real-time debounce filtering by repository name, language, or description.
* **Custom Pinning**: Pin your core active repositories to the top of the list (saved locally in `localStorage`).
* **Metadata Pills**: Language indicator dots, stargazers count, forks, and private locks.

### 5. Conventional Commit Fuel Generator
* **Categorized Templates**:
  * `Mix`: General developmental milestones.
  * `Clean`: Strict Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`).
  * `Witty`: Humorous, relatable developer quips for side projects.
  * `Docs`: Markdown and documentation maintenance.
  * `Hotfix`: Emergency production patches.
* **In-Place Editable Buffer**: Tap directly into the message box to edit or append context before copying.
* **72-Character Length Gauge**: Live character counter with visual warning when headers exceed the 72-character limit.
* **Haptic Copy Action**: One-tap copy to clipboard with confirmation toast.

### 6. Offline Cache Resilience & Zero Token Exposure
* **Zero Downtime Local Cache**: The last successful activity snapshot and repositories list are cached in `localStorage` and Service Worker cache.
* **Automatic Online Synchronization**: Listens for network restoration (`window.addEventListener('online')`) and automatically synchronizes with GitHub.
* **Offline Status Badge**: Non-intrusive badge showing when operating from local snapshots and the exact time of the last sync.

---

## 📱 Mobile-First UI & Ergonomics

Designed specifically for one-handed smartphone operation:
- **Bottom Navigation Bar**: 4-tab bottom navigation (`Pulse`, `Insights`, `Repos`, `Fuel`) with safe-area bottom padding (`env(safe-area-inset-bottom)`).
- **Touch Target Standard**: Every button, pill, and tab adheres to Apple and Android Human Interface Guidelines with touch targets of at least **44×44 px**.
- **Aesthetic**: GitHub Dark (`#090d12`) with high-contrast emerald (`#10b981`) and amber indicators, translucent blurs (`backdrop-blur-xl`), and subtle glowing borders.
- **Standalone Mode**: Configured to launch as a standalone application without browser chrome, search bars, or bottom navigation toolbars.

---

## 🔒 Security & API Architecture

```
┌─────────────────────────────────┐
│     Client (Mobile Browser)     │
│   No token exposed in bundle    │
└────────────────┬────────────────┘
                 │ GET /api/github?username=...
                 │ Optional Header: x-github-token
                 ▼
┌─────────────────────────────────┐
│  Next.js Server / Edge Runtime  │
│  (Vercel Serverless Function)   │
├─────────────────────────────────┤
│  • Reads process.env.GITHUB_TOKEN
│  • Fallback to client override  │
│  • Edge Cache (s-maxage=60)     │
└────────────────┬────────────────┘
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
┌──────────────┐     ┌──────────────┐
│ GitHub GraphQL│    │ GitHub REST  │
│ Contributions │    │ Events/Repos │
└──────────────┘     └──────────────┘
```

1. **No Client Token Leakage**: The default `GITHUB_TOKEN` is securely stored in Vercel environment variables and is never transmitted to or visible in client JavaScript bundles.
2. **Client Override Option**: If a user enters their personal token via the in-app Settings modal, it is stored only on their physical device (`localStorage`) and sent via encrypted HTTPS headers (`x-github-token`) directly to your private API route.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ / v22+ / v25+
- **npm**: v10+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Andreyy05/Gitpulse_phone.git
cd Gitpulse_phone

# Install dependencies
npm install
```

### 3. Environment Setup
Create a local environment file:
```bash
cp .env.example .env.local
```

Configure your variables in `.env.local`:
```env
# Default GitHub username to monitor
GITHUB_USERNAME=Andreyy05

# Optional: GitHub Personal Access Token (PAT)
# Increases rate limits from 60 req/hr to 5,000 req/hr and enables private repo statistics
GITHUB_TOKEN=ghp_your_token_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your desktop browser or access it from your phone on the same Wi-Fi network (e.g. `http://192.168.1.X:3000`).

---

## ☁️ Deployment on Vercel

GitPulse Phone is pre-configured for **zero-config** deployment on **Vercel**:

### Option 1: Vercel Dashboard (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import**.
3. In **Environment Variables**, add:
   - `GITHUB_USERNAME`: Your GitHub username (e.g. `Andreyy05`)
   - `GITHUB_TOKEN`: Your GitHub PAT (optional, recommended)
4. Click **Deploy**. Vercel will build the project and provide your live HTTPS URL.

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📲 Installation as PWA on Phone

### iOS (iPhone / iPad — Safari):
1. Open your deployed Vercel URL in **Safari**.
2. Tap the **Share** button (square with arrow pointing up) at the bottom.
3. Scroll down and tap **"Add to Home Screen"** (*Přidat na plochu*).
4. Tap **"Add"** in the top right.
5. Launch **GitPulse** directly from your home screen — it will run full-screen without Safari browser toolbars.

### Android (Chrome / Brave / Edge):
1. Open your deployed Vercel URL in **Chrome**.
2. Tap the **three-dot menu** (top right) or the bottom banner **"Add GitPulse to Home screen"**.
3. Select **"Install app"** (*Instalovat aplikaci*).
4. Launch GitPulse from your app drawer or home screen widget.

---

## 🛠️ Project Structure

```
Gitpulse_phone/
├── public/
│   ├── favicon.ico
│   ├── manifest.json       # PWA Web App Manifest (standalone, theme-color)
│   ├── sw.js               # Service Worker (offline cache & SWR strategy)
│   └── icons/              # High-res PWA & Apple Touch icons (192, 512)
├── src/
│   ├── app/
│   │   ├── api/github/     # Next.js Server Route Handler (Secure GitHub Telemetry)
│   │   │   └── route.ts
│   │   ├── globals.css     # Dark mode CSS variables, custom scrollbars, animations
│   │   ├── layout.tsx      # Viewport meta tags, apple-touch tags, SW registration
│   │   └── page.tsx        # Mobile tab coordinator (Pulse, Insights, Repos, Fuel)
│   ├── components/
│   │   ├── BottomNav.tsx   # Mobile 4-tab navigation bar with safe-area padding
│   │   ├── CommitFuelCard.tsx # Conventional commit generator & length gauge
│   │   ├── Header.tsx      # Sticky header with sync indicator & avatar
│   │   ├── HeroStreakCard.tsx # Flame streak hero card + midnight countdown
│   │   ├── InsightsCard.tsx# Velocity metrics & weekly rhythm bar chart
│   │   ├── InteractiveContributionHeatmap.tsx # 14d/30d/90d/Year heatmap matrix
│   │   ├── RecentActivityFeed.tsx # Today's live push events list
│   │   ├── RepoQuicklinks.tsx # Repositories list with search & custom pinning
│   │   └── SettingsModal.tsx # Username, PAT token, interval & theme configuration
│   ├── hooks/
│   │   └── useGitPulse.ts  # Client state, SWR synchronization & confetti celebration
│   ├── lib/
│   │   ├── audio.ts        # Web Audio API chime synthesizer
│   │   ├── commitFuel.ts   # Curated commit messages database
│   │   └── github.ts       # GitHub scraping, GraphQL & streak calculation engine
│   └── types/
│       └── index.ts        # Strict TypeScript type definitions
├── .env.example            # Environment variables template
├── next.config.mjs         # Next.js image domain configuration
├── package.json            # Dependencies & build scripts
├── tailwind.config.ts      # Tailwind color extensions & safe-area utilities
└── tsconfig.json           # Strict TypeScript configuration
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with ❤️ by [Andrej Pavliščak](https://github.com/Andreyy05)
