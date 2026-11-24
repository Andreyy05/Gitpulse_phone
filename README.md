# ⚡ GitPulse Mobile (PWA)

> **High-performance, mobile-first Progressive Web App (PWA) for tracking your daily GitHub commit streak, inspecting contribution heatmaps, and generating commit fuel on the go.**

Engineered with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, optimized for mobile viewports (375px – 430px) and seamless zero-config deployment on **Vercel**.

---

## ✨ Features

- 🔥 **Real-Time Streak Monitoring**: Live streak counter, all-time best streak record, and flame status indicators (Safe Today vs. Streak at Risk).
- ⏱️ **Midnight Countdown Engine**: Countdown to local midnight deadline with progress visualization and urgent warnings when &lt; 30 minutes remain without a commit.
- 🟩 **Interactive Contribution Heatmap**: Mobile-optimized contribution matrix with quick toggles for **14 Days**, **30 Days**, **90 Days**, and **Full Year (52 Weeks)**. Tap any cell to inspect exact commits and dates.
- 📊 **Commit Insights & Cadence**: Velocity metrics (commits/day over 30d and 90d), peak weekday analysis, and weekly rhythm distribution bar chart.
- 📌 **Repository Quicklinks**: Searchable repo hub with language badges, stars, forks, private indicators, and custom pinning.
- ✍️ **Commit Fuel Generator**: Curated Conventional Commit generator (`Mix`, `Clean`, `Witty`, `Docs`, `Hotfix`) with an in-place editable buffer and 72-character length gauge.
- 📱 **Installable PWA**: Native-like app experience on iOS & Android with custom icons, standalone display mode, safe-area padding (`pb-safe`), and offline caching via Service Worker.
- 🔒 **Zero Token Exposure**: Secure server-side Next.js Route Handlers (`/api/github`) query GitHub APIs using server environment variables (`GITHUB_TOKEN`), with optional client override stored safely in `localStorage`.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 22/25)
- npm 10+

### 2. Installation
```bash
cd D:\CODING\Gitpulse_phone
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your GitHub username and optional Personal Access Token (PAT):
```env
GITHUB_USERNAME=your_username
GITHUB_TOKEN=ghp_your_pat_token_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your mobile browser or emulator.

---

## ☁️ Deployment on Vercel

GitPulse is built to deploy on **Vercel** with zero custom configuration.

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: Git Push to GitHub
1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Under **Environment Variables**, add:
   - `GITHUB_USERNAME`: Your GitHub username (e.g. `Andreyy05`)
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token (Optional, for higher rate limits)
4. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://gitpulse-phone.vercel.app`).

---

## 📲 How to Install as PWA on Your Phone

### On iOS (iPhone / iPad — Safari):
1. Open your deployed URL in **Safari**.
2. Tap the **Share** button (box with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm by tapping **"Add"**. The GitPulse icon will appear on your home screen and launch in full-screen standalone mode.

### On Android (Chrome / Brave / Edge):
1. Open your deployed URL in **Chrome**.
2. Tap the **three dots menu** (top right) or the banner **"Add GitPulse to Home screen"**.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Launch GitPulse directly from your app drawer.

---

## 🛠️ Project Structure

```
Gitpulse_phone/
├── public/
│   ├── favicon.ico
│   ├── manifest.json       # PWA App Manifest
│   ├── sw.js               # Service Worker (offline cache)
│   └── icons/              # App icons (192x192, 512x512, apple-touch-icon)
├── src/
│   ├── app/
│   │   ├── api/github/     # Secure Next.js API Route Handler
│   │   ├── globals.css     # Tailwind styling & dark theme variables
│   │   ├── layout.tsx      # Root layout with PWA meta & SW registration
│   │   └── page.tsx        # Mobile tab coordinator
│   ├── components/
│   │   ├── BottomNav.tsx   # Mobile 4-tab bottom navigation
│   │   ├── CommitFuelCard.tsx # Conventional commit generator
│   │   ├── Header.tsx      # App header with sync indicator
│   │   ├── HeroStreakCard.tsx # Flame streak + midnight countdown
│   │   ├── InsightsCard.tsx# Velocity metrics & weekly rhythm
│   │   ├── InteractiveContributionHeatmap.tsx # 14d/30d/90d/Year heatmap
│   │   ├── RecentActivityFeed.tsx # Today's push events feed
│   │   ├── RepoQuicklinks.tsx # Repositories list with pinning
│   │   └── SettingsModal.tsx # Username, token & theme settings
│   ├── hooks/
│   │   └── useGitPulse.ts  # Client state, persistence & celebration hook
│   ├── lib/
│   │   ├── audio.ts        # Web Audio API synthesizers
│   │   ├── commitFuel.ts   # Curated commit messages database
│   │   └── github.ts       # GitHub parsing, scraping & GraphQL engine
│   └── types/
│       └── index.ts        # Strict TypeScript type definitions
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📄 License
MIT © 2026 GitPulse
