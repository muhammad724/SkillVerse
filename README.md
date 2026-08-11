# SkillVerse

SkillVerse is a full-stack career development platform that turns professional learning into a mission-based campaign. Learners choose a career, follow a specialized roadmap, complete realistic projects, track their working time, earn XP and achievements, receive admin-assigned work, and publish a recruiter-facing profile.

## Highlights

- Seven career paths with distinct roadmaps and missions
- Supabase email authentication and JWT-protected APIs
- Mission briefs, persistent start/stop timers, drafts, evaluation, and XP
- Admin console for users, missions, assignments, and project reviews
- Public profiles with personal details, professional headline, contact information, skills, verified capabilities, achievements, and projects
- Five-level interactive CSS Grid Arena for Frontend and Full-Stack learners
- Career-aware SkillVerse AI Mentor with authenticated, server-side OpenAI Responses API integration
- Responsive dashboard navigation, command palette, and terminal interface
- Next.js REST endpoints plus a modular Express API
- OpenAPI 3 documentation with interactive Swagger UI
- Sentry integration for browser, Next.js server/edge, and Express errors
- Prisma/PostgreSQL schema, seed scripts, and committed migrations

## Career paths

Frontend Developer, Backend Developer, Full-Stack Developer, QA Automation Engineer, UI/UX Developer, Figma Designer, and Web Designer.

## Technology

| Area | Technology |
| --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript |
| UI | CSS, Framer Motion, Lucide icons, Recharts, Sonner |
| Validation | Zod, React Hook Form |
| Authentication | Supabase Auth with bearer JWTs |
| Database | PostgreSQL on Supabase, Prisma ORM, `pg` adapter |
| REST backend | Next.js Route Handlers and Node.js/Express 5 |
| API documentation | OpenAPI 3, Swagger JSDoc, Swagger UI |
| Monitoring | Sentry for Next.js and Express |
| Quality | ESLint, TypeScript, Node test runner |

## Architecture

```text
Browser
  └─ Next.js application (:3000)
       ├─ React dashboard and public profiles
       ├─ Next.js REST route handlers
       ├─ Supabase Auth
       └─ Prisma ── Supabase PostgreSQL

Express API (:5000)
  ├─ Swagger UI and OpenAPI JSON
  ├─ Mission CRUD endpoints
  ├─ Supabase JWT/admin authorization
  ├─ Prisma ── Supabase PostgreSQL
  └─ Sentry error middleware
```

The Next.js APIs serve the main product. The Express service demonstrates a conventional modular REST backend and exposes documented mission administration endpoints without replacing existing application behavior.

```bash
npm install
```

Copy `.env.example` to `.env` and configure the values. Never commit `.env`.

```env
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
EXPRESS_PORT="5000"
EXPRESS_API_URL=""
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-mini"
```

Initialize the database:

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:seed-careers
```

Run the web application and Express API in separate terminals:

```bash
npm run dev
npm run backend:dev
```

- Web application: http://localhost:3000
- Express API: http://localhost:5000
- Swagger UI: http://localhost:5000/api-docs
- OpenAPI JSON: http://localhost:5000/api-docs.json

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run backend:dev` | Start Express with file watching |
| `npm run build` | Create a production Next.js build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Validate TypeScript |
| `npm test` | Run automated unit and API tests |
| `npm run check` | Run lint, types, and tests |
| `npm run db:migrate:deploy` | Apply committed Prisma migrations |
| `npm run db:seed-careers` | Seed career roadmaps and missions |

## API and authentication

Protected requests use the Supabase access token:

```http
Authorization: Bearer <token>
```

Swagger documents health, monitoring, and mission GET/POST/PATCH/DELETE operations. Admin-only mutations verify the authenticated database profile rather than trusting client-provided roles.

## Sentry verification

1. Create a JavaScript/Next.js or Express project in Sentry.
2. Add its DSN to `SENTRY_DSN`; use `NEXT_PUBLIC_SENTRY_DSN` for browser reporting.
3. Restart both services.
4. In development, request `GET http://localhost:5000/api/sentry-test`.
5. Confirm **Sentry test error** appears in Sentry Issues.

The test route is disabled outside development. DSNs and auth tokens are never hardcoded.

## AI Mentor

Add `OPENAI_API_KEY` to the server environment and optionally change `OPENAI_MODEL`. The key is used only by the protected `/api/ai-mentor` route and is never exposed through a `NEXT_PUBLIC_` variable. Authenticated learners can access the mentor at `/dashboard/ai-mentor`; conversations are limited to the most recent messages and stored only for the browser session.

## Deployment

### Next.js on Vercel

Import the repository, add the environment variables from `.env.example`, set `NEXT_PUBLIC_APP_URL` to the production origin, and deploy. Update Supabase Authentication URL settings with the deployed origin.

### Express on Render

The included `render.yaml` creates the API service. Add database, Supabase, and Sentry environment variables in Render, then set `EXPRESS_API_URL` to the deployed API origin.

Before the first production release:

```bash
npm run db:migrate:deploy
npm run db:seed
npm run db:seed-careers
```

## Security checklist

- Keep `.env` and service-role keys out of source control.
- Rotate any database password that has been shared in chat, logs, or screenshots.
- Use only the Supabase anonymous key in browser code.
- Configure Supabase redirect URLs and email limits for the production domain.
- Enable Sentry with production sampling appropriate for the expected traffic.
- Back up PostgreSQL before applying production migrations.

## Current release status

