# Discover Florida Parks

A fast, SEO-focused directory of Florida's parks, preserves, and outdoor attractions — built with Next.js + Supabase and monetized through affiliate links, display ads, and future products. Live at **[www.discoverfloridaparks.com](https://www.discoverfloridaparks.com)**.

> **AI assistants:** read [`CLAUDE.md`](./CLAUDE.md) first — it's the canonical project reference (architecture, design system, schema, conventions, gotchas).

## Stack

- **Next.js** (App Router, TypeScript, Tailwind v4)
- **Supabase** — Postgres, Auth (`@supabase/ssr`), Storage
- **Vercel** — hosting; production auto-deploys from `main`
- **Mapbox GL** (maps) · **Resend** (email) · **Kit** (newsletter) · **Google Places** (hotel data)
- **Google AdSense + Analytics** via `@next/third-parties`
- Fonts: Shrikhand / Glegoo / Archivo (the "Birdily" design system)

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Create `.env.local` with the variables listed in [`CLAUDE.md`](./CLAUDE.md#environment-variables) (Supabase URL + keys, Mapbox token, Google Places key, Resend/Kit keys, affiliate CJ URLs, AdSense/GA IDs).

```bash
npm run build      # production build
npm run lint       # eslint
```

## Project layout

```
src/app/          Routes (public pages, /admin, /api)
src/components/    Shared UI (ParkCard, GearRecommendations, AdUnit, …)
src/lib/          Supabase clients, blog, gear, news-feeds
supabase/         Schema + rls.sql (single source of truth for RLS/GRANTs)
scripts/          Data enrichment / maintenance (npx tsx scripts/<name>.ts)
hermes/           Standalone weekly monitoring agent
docs/             Deep-dive references
```

## Key workflows

- **Add a park:** see [`PARK-ONBOARDING.md`](./PARK-ONBOARDING.md)
- **Data enrichment / fixes:** `npx tsx scripts/<name>.ts` (see the Scripts table in `CLAUDE.md`)
- **Monitoring:** `hermes/` runs weekly via launchd; manual: `cd hermes && node index.js --dry-run`

## Deploy

Push to `main` → Vercel builds and deploys production. Preview deploys are created for other branches / PRs.

---

Documentation index: [`CLAUDE.md`](./CLAUDE.md) (reference) · [`PARK-ONBOARDING.md`](./PARK-ONBOARDING.md) (onboarding) · [`docs/experiences-system-as-built.md`](./docs/experiences-system-as-built.md) (experiences deep-dive) · [`DFP-Monetization-Brief.md`](./DFP-Monetization-Brief.md) (strategy brief).
