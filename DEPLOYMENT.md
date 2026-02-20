# 🚀 CRM Pipeline - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon or Supabase)
- Vercel account

### 1. Clone & Install

```bash
# Clone the repository
cd crm-pipeline

# Install dependencies
npm install
```

### 2. Database Setup

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. It looks like: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### 3. Environment Variables

Create `.env` file:

```env
# Database - Required
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&sslmode=require"

# App URL - Optional (for production)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Run Locally

```bash
# Development
npm run dev

# Build for production
npm run build
npm start
```

---

## Vercel Deployment

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### Step 2: Configure Environment
In Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL = your_postgres_connection_string
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

### Step 3: Deploy
Click "Deploy" - Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Start the production server

---

## Troubleshooting

### ❌ "Cannot connect to database"

**Solution:**
1. Check DATABASE_URL is correct
2. Verify your IP is allowed in Neon/Supabase
3. Ensure `?sslmode=require` is in the connection string

```env
# Wrong
DATABASE_URL="postgresql://..."

# Correct  
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### ❌ "Prisma client not found"

**Solution:**
```bash
npm run db:generate
```

### ❌ "Environment variable missing"

**Solution:**
Add the missing variables in Vercel dashboard. Check `.env.example` for all required variables.

### ❌ "Build failed"

**Solution:**
1. Check all dependencies are in `package.json`
2. Run `npm run build` locally first
3. Check for TypeScript errors

---

## Project Structure

```
crm-pipeline/
├── app/
│   ├── (dashboard)/        # Protected routes with sidebar
│   │   ├── page.tsx        # Dashboard
│   │   ├── pipeline/       # Pipeline/Kanban
│   │   ├── companies/      # Companies CRUD
│   │   ├── contacts/      # Contacts CRUD
│   │   ├── tasks/         # Tasks
│   │   └── activities/    # Activities
│   └── api/               # API routes
│       ├── companies/
│       ├── contacts/
│       ├── deals/
│       ├── tasks/
│       ├── activities/
│       └── dashboard/
├── components/
│   ├── ui/               # Reusable UI components
│   └── pipeline/         # Pipeline-specific components
├── lib/
│   ├── prisma.ts         # Database client
│   ├── env.ts            # Environment validation
│   ├── utils.ts          # Utility functions
│   └── store.ts          # Zustand stores
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── index.ts          # TypeScript types
```

---

## Features

### ✅ Implemented
- Dashboard with analytics and charts
- Kanban pipeline with drag & drop
- Companies CRUD
- Contacts CRUD
- Deals management
- Tasks with due dates
- Activity logging
- Revenue forecasting
- AI-ready data structure

### 🔮 AI-Ready Architecture
The schema includes fields for future AI features:
- `ai_score` - Deal scoring
- `forecast_amount` - Revenue forecasting
- `sentiment_analysis` - Activity sentiment
- `sentiment_score` - Contact sentiment

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Dashboard stats |
| GET/POST | /api/companies | Companies list/create |
| GET/PATCH/DELETE | /api/companies/:id | Company detail |
| GET/POST | /api/contacts | Contacts list/create |
| GET/PATCH/DELETE | /api/contacts/:id | Contact detail |
| GET/POST | /api/deals | Deals list/create |
| GET/PATCH/DELETE | /api/deals/:id | Deal detail |
| GET/POST | /api/tasks | Tasks list/create |
| GET/PATCH/DELETE | /api/tasks/:id | Task detail |
| GET/POST | /api/activities | Activities list/create |

---

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel

---

## License

MIT
