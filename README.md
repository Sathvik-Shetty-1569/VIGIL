<div align="center">

<h1>👁️ VIGIL</h1>
<p>An AI productivity agent that watches your goals and delivers a cold, honest weekly verdict</p>

### *It doesn't push you. It watches.*

<br/>

<a href="https://vigil-app-six.vercel.app">
  <img src="https://img.shields.io/badge/🌐  LIVE  DEMO  —  vigil--app--six.vercel.app-%230f172a?style=for-the-badge&logoColor=white" height="40"/>
</a>

<br/><br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-f55036?style=for-the-badge)](https://groq.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## What is VIGIL?

VIGIL is an **AI Productivity Agent** that silently observes your goals, breaks them into actionable tasks, and scores your progress — no motivational fluff, no push notifications, no empty hype.

You set the goals. You do the work. VIGIL watches.

At the end of the week, it delivers a **verdict**.

---

## 📸 Preview


![VIGIL Landing Page](./LandingPage.png)
---


## ✨ Features

### 🎯 Goal Management
Set goals with deadlines. VIGIL keeps track — no reminders, no nagging.

### 🤖 AI Task Breakdown
Powered by **LLaMA 3.3 70B via Groq**, VIGIL auto-generates a smart, realistic task list for every goal you add.

### ✅ Daily Task Tracking
Check off tasks as you complete them. Watch your progress bar move.

### 📊 Weekly Review
Every week, VIGIL reviews what you did — and what you didn't. It scores your week and delivers a **cold, honest verdict**.

### 🔐 Auth & Onboarding
Seamless sign-in with **Clerk** (email + Google). Smooth onboarding to get your first goals in immediately.

---

## 🏗️ Architecture

<table>
  <tr>
    <th width="33%">🖥️ Frontend</th>
    <th width="33%">🗄️ Backend</th>
    <th width="33%">🤖 AI</th>
  </tr>
  <tr>
    <td align="center">
      Next.js 14 App Router<br/>
      TypeScript<br/>
      Tailwind CSS<br/>
      Glassmorphism UI
    </td>
    <td align="center">
      Supabase (PostgreSQL)<br/>
      Clerk Authentication<br/>
      Server Actions<br/>
      Vercel Deployment
    </td>
    <td align="center">
      Groq API<br/>
      LLaMA 3.3 70B<br/>
      Task Generation<br/>
      Weekly Scoring
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Glassmorphism |
| **Auth** | Clerk |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Groq API — LLaMA 3.3 70B Versatile |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.dev) account
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/Sathvik-Shetty-1569/VIGIL.git
cd VIGIL

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq
GROQ_API_KEY=your_groq_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
VIGIL/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main dashboard
│   ├── goals/[id]/           # Goal detail + AI task breakdown
│   ├── onboarding/           # New user flow
│   └── review/               # Weekly AI review
├── components/               # Reusable UI components
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── groq.ts               # Groq AI calls
└── public/                   # Static assets
```

---

## 🗄️ Database Schema

```sql
-- Goals table
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  deadline date,
  created_at timestamp default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  user_id text not null,
  title text not null,
  completed boolean default false,
  created_at timestamp default now()
);
```

---

## 🗺️ Roadmap

- [ ] Fix Supabase RLS with Clerk JWT for production security
- [ ] Streak tracking and focus score analytics
- [ ] Daily task suggestions based on upcoming deadlines
- [ ] Email digest with weekly verdict
- [ ] Mobile app (React Native)

---

<div align="center">

**[🌐 Live Demo](https://vigil-app-six.vercel.app)** · **[🐛 Report Bug](https://github.com/Sathvik-Shetty-1569/VIGIL/issues)** · **[✨ Request Feature](https://github.com/Sathvik-Shetty-1569/VIGIL/issues)**

<br/>

*Built with Next.js · Powered by Groq · Deployed on Vercel*

<br/>

⭐ Star this repo if it helps you!

</div>
