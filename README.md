# SkillVerse

SkillVerse is a full-stack career development platform that turns professional learning into a mission-based campaign. Learners choose a career, follow a specialized roadmap, complete realistic projects, track their working time, earn XP and achievements, receive admin-assigned work, and publish a recruiter-facing profile.

## Highlights

- Seven career paths with distinct roadmaps and missions
- Supabase email authentication and JWT-protected APIs
- Mission briefs, persistent start/stop timers, drafts, evaluation, and XP
- Admin console for users, missions, assignments, and project reviews
- Public profiles with personal details, professional headline, contact information, skills, verified capabilities, achievements, and projects
- Five-level interactive CSS Grid Arena for Frontend and Full-Stack learners
- Career-aware SkillVerse AI Mentor with authenticated, server-side Groq integration and optional OpenAI fallback
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

