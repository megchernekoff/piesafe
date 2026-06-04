# Pie Safe — Meal Planning App

## What this is
A personal meal planning web app. Users set dietary preferences, maintain a recipe library, import recipes from URLs, and generate AI-powered weekly dinner plans with grocery lists and toddler adaptations.

## Stack
- **Next.js** (App Router, TypeScript)
- **Clerk** (`@clerk/nextjs`) — auth, every user_id comes from Clerk
- **Turso** (`@libsql/client`) — hosted libsql, env vars `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- **Anthropic SDK** — meal plan generation + URL recipe parsing
- **Tailwind CSS v4** + custom design system in `app/globals.css`
- **lucide-react** — icons

## Running locally
```bash
cp .env.local.example .env.local  # fill in all keys
npm install
npm run dev
# → http://localhost:3000
# First run: POST /api/setup to initialize DB schema
```

## Deploying (Render)
Set all env vars from `.env.local.example`. Run `POST /api/setup` once after first deploy.

## Project structure
```
app/
  (app)/           – authenticated route group (sidebar layout)
    dashboard/
    recipes/
    plan/
    preferences/
  sign-in/[[...sign-in]]/
  sign-up/[[...sign-up]]/
  api/
    preferences/   – GET/POST user profile
    setup/         – POST to run schema init (once)
  layout.tsx       – root layout with ClerkProvider
  page.tsx         – public landing page
components/
  Sidebar.tsx      – client nav component
lib/
  db.ts            – Turso client + initializeSchema()
proxy.ts           – Clerk auth (protects all routes except /, /sign-in, /sign-up)
schema.sql         – canonical schema (reference copy)
.env.local.example – all required env vars with instructions
```

## Data model
All rows are scoped to `user_id` (Clerk user ID, TEXT).

| Table | Purpose |
|-------|---------|
| `profiles` | Preferences: household_size, toddler_mode, dislikes[], dietary_restrictions[] |
| `recipes` | Per-user recipe library |
| `meal_plans` | Generated weekly plans with grocery_list JSON |

## Adding features
- New authenticated page → add to `app/(app)/`, it gets sidebar + auth automatically
- New API route → import `auth` from `@clerk/nextjs/server`, always check `userId`
- New table → add to `lib/db.ts:initializeSchema()` and `schema.sql`

## Design system
CSS custom properties and utility classes are in `app/globals.css`. Key colors: `--ink`, `--sand`, `--driftwood`, `--tide`, `--kelp`. Fonts: Cormorant Garamond (headings), DM Sans (body).
