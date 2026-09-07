---
name: anrotrip
description: ANRO TRIP tourism agency site (Astro 7, Tailwind v4, SSR). Use for any work in white_anrotrip — components, blog, forms, deploy, SEO, or audit follow-ups. Read constitution and AGENTS.md first; respect frozen Header and production blur workaround.
---

# ANRO TRIP — project skill

## Read first (canonical)

| File                                          | When                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `.specify/memory/constitution.md`             | **Always** — hard rules (Tailwind v4, no extra CSS files, frozen header) |
| `AGENTS.md`                                   | Stack, commands, structure, patterns                                     |
| `.doc/architecture/architecture-reference.md` | Middleware, `src/lib/`, widgets                                          |
| `.doc/audits/AUDIT-PLAN-STATUS.md`            | Audit pause — stage 6 not done                                           |

## Stack (short)

- Astro 7 SSR (`@astrojs/node`), TypeScript strict, pnpm, Node `>=22.23.0 <23`
- Tailwind v4 — `bg-linear-to-r`, tokens in `src/styles/global.css` `@theme`
- Icons: `astro-iconify` + `FaIcon.astro` (no Font Awesome webfont)
- Forms: zod in `src/lib/schemas.ts`, API in `src/pages/api/`, honeypot + rate-limit
- NAP / phones / offices: **`src/data/company.ts` only**

## Before commit

```bash
pnpm check   # required
pnpm lint    # if touching TS/Astro
```

Pre-commit (lefthook): format staged + `pnpm check`.

## Do not change without explicit request

- `src/components/Header.astro` — see `.doc/navigation/header-frozen.md`
- `vite.build.cssMinify: false` in `astro.config.mjs` — blur in production
- `security.allowedDomains` in `astro.config.mjs` — rate-limit client IP

## HTML comments in Astro

Do **not** put `<!-- ... -->` inside JSX expressions (`{items.map(...)}`, ternaries). Prettier/lefthook fails. Use comments outside `{}` blocks only.

## Widgets

- **Nemo** flights: `NemoSearch.astro`, lazy `IntersectionObserver`, `src/lib/nemo-config.ts`
- **Tourvisor** tours: inline in `SearchWidget.astro` + `src/lib/client/search-widget.ts` (no separate `TourvisorSearch.astro`)
- **FavoritesWidget**: Tourvisor cart wrapper

## Related skills (installed via `pnpm skills:install`)

Use domain skills from [skills.sh](https://www.skills.sh/) when relevant: `astro`, `tailwind-4-docs`, `core-web-vitals`, `seo-audit`, `schema`, `playwright-best-practices`, `docker-patterns`, etc. Full list: `.doc/meta/skills-primary-shortlists.md`.

## Audit tails (stage 6)

Prerender, PWA service worker, Metrika, nonce-CSP, Redis rate-limit — see `.doc/audits/AUDIT-PLAN-STATUS.md`.
