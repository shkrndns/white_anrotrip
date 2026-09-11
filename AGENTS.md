# ANRO TRIP — Руководство для ИИ-агентов

Сайт туристического агентства «ANRO TRIP». Основной офис — **Челябинск**; представительства — Москва, Екатеринбург.

## Обязательный протокол (без запроса пользователя)

**Каждая сессия и каждая задача** — агент сам:

1. Читает `.specify/memory/constitution.md` и `.agents/skills/anrotrip/SKILL.md` (после `pnpm skills:install`).
2. Открывает релевантные `.doc/*` и skills по таблицам в `.cursor/rules/01-docs-routing.mdc` и `02-skills-routing.mdc`.
3. Не ждёт «прочитай AGENTS.md» — контекст подтягивается проактивно.

Правила Cursor (always apply): `.cursor/rules/00-agent-protocol.mdc` и др.

> **Конституция проекта:** `.specify/memory/constitution.md` — читать первым делом!  
> **Документация:** `.doc/` — справочные документы **только локально** (не в git); указатель: `.doc/README.md` при наличии.  
> **Архитектура:** `.doc/architecture/architecture-reference.md` — middleware, `src/lib/`, виджеты, контент.  
> **Agent skills:** `.doc/meta/skills-primary-shortlists.md` — skills.sh; установка: `pnpm skills:install`  
> **⚠️ План аудита не завершён** (пауза 2026-09-07): `.doc/audits/AUDIT-PLAN-STATUS.md` — этап 6 и хвосты; не считать аудит закрытым.

---

## Команды (перед коммитом)

| Команда                | Что делает                                                |
| ---------------------- | --------------------------------------------------------- |
| **`pnpm check`**       | TypeScript + Astro check — **обязательно перед коммитом** |
| `pnpm lint`            | oxlint (TS) + eslint (astro + jsx-a11y)                   |
| `pnpm format:check`    | Prettier (ts/js/json/yml/css/md)                          |
| `pnpm spellcheck`      | cspell по `src/**/*.{astro,md}`                           |
| `pnpm test:e2e`        | Playwright smoke (нужен `pnpm build` + preview)           |
| `pnpm dev`             | Dev-сервер localhost:4321                                 |
| `pnpm build`           | Production сборка (`prebuild` → `optimize:images`)        |
| `pnpm preview`         | Preview production-сборки                                 |
| `pnpm optimize:images` | Sharp-оптимизация ассетов                                 |
| `pnpm typograf:blog`   | Типографика markdown блога                                |

Pre-commit (lefthook): `pnpm check` + prettier на staged-файлах.

---

## Технологический стек

| Слой            | Технология                                                  |
| --------------- | ----------------------------------------------------------- |
| Framework       | **Astro 7.x** — SSR, `@astrojs/node` standalone             |
| Styling         | **Tailwind CSS 4.x** (v4 синтаксис!)                        |
| Language        | TypeScript strict                                           |
| Package manager | **pnpm 11.x**                                               |
| Node            | **>=22.23.0 <23** (см. `.node-version`)                     |
| Images          | Sharp + WebP; `<Image>` из `astro:assets`                   |
| Icons           | **astro-iconify** + `FaIcon.astro` (Font Awesome удалён)    |
| Fonts           | @fontsource Inter + Montserrat (cyrillic + latin, локально) |
| Forms API       | nodemailer SMTP + Telegram Bot + **zod**                    |
| SEO             | `@astrojs/sitemap`, JSON-LD в `Layout.astro`                |
| Quality         | oxlint, eslint, prettier, cspell, Playwright, Lighthouse CI |

---

## Структура проекта

```
src/
├── assets/
│   ├── hero/           # world.webp
│   ├── tours/          # карточки «Актуальные предложения»
│   ├── team/           # фото сотрудников
│   ├── partners/       # Partners.astro (статы)
│   ├── our-partners/   # OurPartners.astro (логотипы туроператоров)
│   ├── reviews/        # фото рецензентов + external/
│   ├── awards/         # сертификаты и награды
│   └── certif/         # подарочный сертификат
├── components/
│   ├── ui/             # Modal, SectionHeading, SocialLinkIcon, FaIcon
│   ├── widgets/        # NemoSearch, ExternalReviewsRow
│   ├── about/          # AboutHero, AboutBenefitsGrid, …
│   ├── blog/           # BlogHero, BlogPostCard, …
│   ├── reviews/        # ReviewsLightbox, ReviewFormOverlay
│   └── *.astro         # секции страниц
├── data/               # company, team, tours, faq, services, …
├── content/blog/       # markdown статьи + _drafts/
├── lib/
│   ├── client/         # bundled client modules (forms, scroll, widgets)
│   ├── env.ts          # zod-валидация SMTP/Telegram env
│   ├── mail-*.ts       # транспорт, telegram, templates, rate-limit
│   └── …               # schemas, security, site-urls, nemo-config
├── layouts/Layout.astro
├── pages/
│   ├── api/            # callback, gift, review
│   ├── blog/           # index, page/[page], [slug]
│   ├── index.astro
│   ├── 404.astro
│   ├── cabinet.astro
│   ├── privacy.astro
│   └── terms.astro
├── styles/global.css
├── env.d.ts            # ImportMetaEnv + Window augmentation
└── content.config.ts   # коллекция blog (draft, featured, max-import)
src/_archive/corp/      # черновик /corp (не в src/pages/)
.env.example            # шаблон переменных окружения (корень репо)
e2e/                    # Playwright smoke-тесты
```

---

## Дизайн-система

Токены в `src/styles/global.css` → `@theme`: `--color-primary`, `--color-red`, `--font-montserrat`, `--font-inter`, `--breakpoint-nav: 90rem` (`nav:`), z-шкала (`z-modal`, `z-overlay-top`), `--font-size-micro/caption`.

Tailwind v4: `bg-linear-to-r` (не `bg-gradient-to-r`).

---

## Известные особенности

### Blur в production

`vite.build.cssMinify: false` в `astro.config.mjs` — **не менять** (Tailwind v4 + Vite ломает `backdrop-blur-*`). См. `.doc/deploy/notes-blur-production.md`.

### Хедер — заморожен

`Header.astro` — не менять без явной просьбы. `.doc/navigation/header-frozen.md`, `.doc/navigation/header-anchor-scroll.md`.

### Corp — в архиве

Маршрут `/corp` **не публикуется**. Восстановление: `src/_archive/corp/` → `src/pages/corp.astro`.

### Astro 7: rate-limit и IP

В `astro.config.mjs` обязателен `security.allowedDomains` — иначе `clientAddress` = IP прокси, rate-limit на весь сайт. См. аудит P0-1.

### Tourvisor

Вкладка «Туры и Отели» в `SearchWidget.astro` — lazy-load JS Tourvisor. Полная перезагрузка при `<a href="/">` (не View Transitions). `FavoritesWidget` — обёртка над корзиной Tourvisor.

### Nemo

`NemoSearch.astro` — lazy через `IntersectionObserver`; конфиг в `src/lib/nemo-config.ts` + data-атрибуты на `#nemo-root`.

---

## Паттерны

### Модалки

`CallbackModal`, `GiftModal`, `ReviewFormOverlay` → `ui/Modal.astro`. Scroll-lock: `src/lib/client/scroll-lock.ts`. Focus-trap: `focus-trap.ts`.

### Формы

Клиент: `form-submit.ts`. Сервер: `src/pages/api/*.ts`, zod в `schemas.ts`, honeypot + rate-limit. Док: `.doc/forms/forms.md`.

### Data layer

Статика секций — `src/data/*.ts`. NAP — **`src/data/company.ts`** (единственный канон телефонов, email, офисов, schema).

---

## Страницы

| Маршрут              | Файл                | Примечание                     |
| -------------------- | ------------------- | ------------------------------ |
| `/`                  | `index.astro`       | Hero, SearchWidget, все секции |
| `/blog`              | `blog/index.astro`  | SSR, пагинация `/blog/page/N`  |
| `/blog/[slug]`       | `blog/[slug].astro` | Статья                         |
| `/404`               | `404.astro`         | `robots=noindex`               |
| `/cabinet`           | `cabinet.astro`     | форма → lk.anrotrip.ru         |
| `/terms`, `/privacy` | legal               | SSR                            |

---

## Деплой

```
push main → CI (check, lint, e2e) → GHCR образ
         → Deploy workflow (вручную, deploy: true) → Beget VPS → Caddy → :4321
```

- Образ: `ghcr.io/shkrndns/white_anrotrip:latest`
- GitHub: `github.com/shkrndns/white_anrotrip`
- Health-gate + rollback в `deploy.yml`
- Чеклист: `.doc/deploy/deploy-prep-checklist.md`

---

## Контакты (канон)

Источник: `src/data/company.ts`.

- **Телефон бесплатный:** 8 (800) 222-44-73
- **Мобильный / WhatsApp / Telegram:** +7 (922) 026-70-59
- **Email сайт:** anro@anrotrip.ru · **команда:** online@anrotrip.ru
- **Офис (primary):** г. Челябинск, ул. 250-летия Челябинска, д. 29, пом. 2
- **Представительства:** Москва, Екатеринбург
- **Сайт:** https://anrotrip.ru
