# CampusAI 🎓

> **AI-Powered Smart Campus Management & Placement Intelligence Platform**

CampusAI is a production-grade full-stack web application built with Next.js 15+ (App Router), TypeScript, and Google Gemini AI. It serves four distinct user roles: Students, Faculty, HODs, and Administrators.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v4 |
| AI | Google Gemini SDK |
| State | TanStack Query + Zustand |
| Email | Resend |
| Storage | Cloudinary |
| Testing | Vitest + Playwright |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Cloudinary account
- Resend account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd CampusAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in all required values in .env.local
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
CampusAI/
├── app/                  # Next.js App Router pages
│   ├── (public)/         # Public-facing pages (landing, about, etc.)
│   ├── (auth)/           # Authentication pages (login, forgot-password)
│   ├── (student)/        # Student role pages
│   ├── (faculty)/        # Faculty role pages
│   ├── (hod)/            # Head of Department role pages
│   ├── (admin)/          # Administrator role pages
│   └── api/              # API routes
├── components/           # Reusable UI components
├── features/             # Feature-based business logic modules
├── lib/                  # Utility libraries and clients
├── prisma/               # Database schema and migrations
├── prompts/              # AI prompt templates
└── tests/                # Unit, integration, and E2E tests
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npx playwright test` | Run E2E tests |
| `npx prisma studio` | Open Prisma Studio |

## User Roles

- **Student** — Attendance, timetable, resources, assignments, quizzes, placement, AI assistant
- **Faculty** — Course management, attendance marking, resources, assignments, analytics
- **HOD** — Department oversight, faculty management, placement tracking, reports
- **Admin** — System administration, user management, full platform control

## License

Private — All rights reserved.
