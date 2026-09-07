# Справочник архитектуры ANRO TRIP

> **Актуально:** сентябрь 2026 · Astro 7 · SSR + Node adapter  
> Дополняет `AGENTS.md` и `.specify/memory/constitution.md`.

---

## Astro 7: обязательные настройки

Файл `astro.config.mjs`:

| Опция                                         | Зачем                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `security.allowedDomains`                     | Доверие `X-Forwarded-For` за Caddy/Cloudflare → реальный IP клиента и **per-IP rate-limit** |
| `adapter: node({ bodySizeLimit: 64 * 1024 })` | Защита от memory DoS на POST `/api/*`                                                       |
| `site: 'https://anrotrip.ru'`                 | Canonical, sitemap                                                                          |
| `vite.build.cssMinify: false`                 | Сохранение `backdrop-blur` (см. notes-blur-production)                                      |
| `vite.define.OG_IMAGE_VERSION`                | Cache-bust og-image без `stat()` на каждый запрос                                           |

Dev/preview: в `allowedDomains` добавлены `localhost` / `127.0.0.1`.

Блог — **SSR** (не prerender): маршруты `blog/index`, `blog/page/[page]`, `blog/[slug]`. Legacy `/blog/N` → 301 на `/blog/page/N` в middleware.

---

## Middleware и CSP

`src/middleware.ts`:

1. **301** legacy-пагинация блога.
2. **Security headers** на все ответы: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS (prod).
3. **Cache-Control:** HTML 200 → `s-maxage=300`; `/api/*` → `no-store`; 404 HTML → `no-cache`.

CSP (`unsafe-inline` для Nemo/Tourvisor и остатков inline):

- `script-src`: self, tourvisor.ru, cdn.nemo.travel
- `connect-src`: ticket.anrotrip.ru, cdn.nemo.travel
- `form-action`: self, lk.anrotrip.ru (кабинет)

Дублирование базовых заголовков — также в `Caddyfile`. Origin/Referer на POST — `src/lib/security.ts`.

---

## `src/lib/` — карта модулей

| Модуль                          | Назначение                              |
| ------------------------------- | --------------------------------------- |
| `env.ts`                        | zod-схема SMTP/Telegram env (runtime)   |
| `schemas.ts`                    | zod-схемы форм (callback, gift, review) |
| `security.ts`                   | Origin/Referer, `safeApiError()`        |
| `site-urls.ts`                  | Canonical URL, whitelist хостов в prod  |
| `api-url.ts` / `api-request.ts` | `siteApi()`, разбор FormData            |
| `mail-transport.ts`             | SMTP singleton `pool: true`             |
| `mail-telegram.ts`              | Telegram Bot уведомления                |
| `mail-templates.ts`             | HTML/plain шаблоны писем                |
| `rate-limit.ts`                 | In-memory limiter (5 / 10 мин / IP)     |
| `mailer.ts`                     | Re-export публичного API                |
| `nemo-config.ts`                | CDN base, booking URL Nemo              |
| `schema-blog.ts`                | JSON-LD BlogPosting                     |
| `external-reviews.ts`           | Яндекс + 2ГИС для виджетов и schema     |
| `blog-list.ts`                  | Пагинация блога (SSR)                   |
| `form-classes.ts`               | DRY CSS-классы форм                     |
| `typograf.ts`                   | Типограф для runtime                    |
| `client/*.ts`                   | Bundled browser modules (см. ниже)      |

---

## Client modules (`src/lib/client/`)

| Файл                                                          | Где используется                   |
| ------------------------------------------------------------- | ---------------------------------- |
| `form-submit.ts`                                              | Callback, Gift, Review forms       |
| `scroll-lock.ts`, `smooth-scroll.ts`, `scroll-reveal.ts`      | Layout                             |
| `focus-trap.ts`                                               | Модалки, drawer, cookie banner     |
| `nemo-widget.ts`                                              | NemoSearch (lazy boot)             |
| `search-widget.ts`                                            | SearchWidget tabs + Tourvisor lazy |
| `layout-navigation.ts`                                        | Layout (якоря, pending hash)       |
| `reviews-lightbox.ts`, `review-form-overlay.ts`               | Reviews                            |
| `partners-marquee.ts`                                         | Partners / OurPartners             |
| `faq-accordion.ts`, `team-list-toggle.ts`, `scroll-to-top.ts` | секции                             |

Window API — `src/env.d.ts` (слито с бывшим `window.d.ts`).

---

## Глобальные виджеты в Layout

| Компонент                    | Роль                                            |
| ---------------------------- | ----------------------------------------------- |
| `CallbackModal`, `GiftModal` | Формы заявок                                    |
| `ReviewFormOverlay`          | Форма отзыва (в Reviews)                        |
| `OfficeWidget`               | Плавающий виджет офиса (corp-вариант в archive) |
| `FavoritesWidget`            | Избранное Tourvisor (desktop)                   |
| `ScrollProgress`             | Индикатор прогресса scroll                      |
| `ScrollToTop`                | Кнопка «наверх»                                 |
| `CookieBanner`               | 152-ФЗ согласие                                 |

---

## Partners vs OurPartners

| Комponent           | Данные                     | Содержание                                 |
| ------------------- | -------------------------- | ------------------------------------------ |
| `Partners.astro`    | `src/data/partners.ts`     | Статистика / преимущества (иконки + цифры) |
| `OurPartners.astro` | `src/data/our-partners.ts` | Логотипы туроператоров (marquee)           |

---

## Контент: `content.config.ts`

Коллекция `blog`:

- `draft: boolean` — скрывает черновики (импорт MAX в `_drafts/`)
- `featured` — одна крупная карточка на главной
- `heroImage`, `cardImage`, `heroImages`
- `source`, `sourceId`, `sourceUrl` — метаданные импорта MAX

Команды: `pnpm import:max-blog`, `pnpm typograf:blog`.

---

## Два офиса (канон NAP)

Источник: **`src/data/company.ts`**.

| Офис             | `isPrimary` | Адрес / телефон                                 |
| ---------------- | ----------- | ----------------------------------------------- |
| **Челябинск**    | `true`      | ул. 250-летия Челябинска, 29; 8 (351) 225-29-91 |
| **Екатеринбург** | `false`     | представительство; toll-free 8-800              |

Schema.org: `TravelAgency` + `LocalBusiness` (Челябинск). `representativeCities`: Москва, Екатеринбург.

**Не путать:** в старых доках «основной офис Екатеринбург» — устарело.

---

## Восстановление `/corp`

1. Скопировать `src/_archive/corp/corp.astro` → `src/pages/corp.astro`
2. Ассеты уже в `src/_archive/corp/assets/`
3. Обновить навигацию в Header — **только по запросу заказчика** (header frozen)
4. Проверить schema и sitemap

---

## Quality tooling

| Команда           | CI                   |
| ----------------- | -------------------- |
| `pnpm check`      | deploy + ci.yml      |
| `pnpm lint`       | deploy + ci.yml      |
| `pnpm spellcheck` | ci.yml               |
| `pnpm test:e2e`   | ci.yml (после build) |
| `pnpm lhci`       | ci.yml (PR only)     |

Конфиги: `eslint.config.js`, `.oxlintrc.json`, `cspell.config.yaml`, `playwright.config.ts`, `lighthouserc.cjs`, `lefthook.yml`.

---

## Compose local vs prod

| Файл                | Назначение                                            |
| ------------------- | ----------------------------------------------------- |
| `compose.yml`       | Prod: Caddy + app, `NODE_ENV=production`, healthcheck |
| `compose.local.yml` | Локальный Docker-тест без домена                      |

См. `.doc/server-vps-stack-plan.md`, `.doc/forms.md`.
