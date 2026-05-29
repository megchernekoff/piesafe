# Plato — Meal Planning App

## What this is
A personal meal planning web app for Meg's household. Generates weekly dinner plans, maintains a recipe library, imports recipes from URLs, and surfaces recipe links from Gmail newsletters.

## Stack
- **Next.js 15** (App Router, TypeScript)
- **libsql** (`@libsql/client`) — SQLite at `./mealplan.db`
- **Anthropic SDK** — meal plan generation + URL recipe parsing
- **Gmail MCP** — email scanning feature
- **Tailwind CSS**

## Running locally
```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm install
npm run dev
# → http://localhost:3000
```

## Deploying
`npm run build && npm start`

For cloud (Railway, Render, etc.): set `ANTHROPIC_API_KEY`. SQLite writes to local disk — fine for a VPS/container. For Vercel serverless, swap to a hosted Turso DB (same `@libsql/client` API, just change the URL in `lib/db.ts`).

## Customizing
Edit `lib/prefs.ts` for dislikes, toddler name/age, email senders to scan.

## API Routes
- `POST /api/meal-plan` — generate plan; `GET` retrieves history
- `GET/POST/DELETE /api/recipes` — recipe library CRUD  
- `POST /api/import-url` — scrape + parse a recipe from URL
- `POST /api/email-scan` — Gmail scan; `GET` returns cached results

## Gmail MCP note
Email scanning uses Anthropic MCP with the user's Gmail OAuth. Works out of the box in Claude Code with Gmail connected. For standalone deploy, you'd need your own OAuth.
