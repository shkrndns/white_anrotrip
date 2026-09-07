# Документация проекта (`.doc/`)

> **Актуально:** сентябрь 2026  
> Конституция: `.specify/memory/constitution.md` · для агентов: **`AGENTS.md`** · архитектура: **[architecture-reference.md](./architecture-reference.md)**

---

## Старт здесь

| Документ                                                 | Когда читать                                  |
| -------------------------------------------------------- | --------------------------------------------- |
| [audit-2026-09-full.md](./audit-2026-09-full.md)         | Полный аудит + журнал этапов 0–5              |
| [architecture-reference.md](./architecture-reference.md) | Astro 7, middleware, `src/lib/`, виджеты, NAP |
| [project-roadmap.md](./project-roadmap.md)               | Фазы проекта (чекбоксы)                       |
| [forms.md](./forms.md)                                   | Формы, API, `.env`, 152-ФЗ                    |

**Команды качества:** `pnpm check` · `pnpm lint` · `pnpm test:e2e` · `pnpm spellcheck`

---

## Инфраструктура и деплой

| Документ                                               | Описание                                                 |
| ------------------------------------------------------ | -------------------------------------------------------- |
| [server-vps-stack-plan.md](./server-vps-stack-plan.md) | Beget VPS, Docker, Caddy, GHCR `shkrndns/white_anrotrip` |
| [deploy-prep-checklist.md](./deploy-prep-checklist.md) | Подготовка к первому деплою                              |
| [gitflic-mirror.md](./gitflic-mirror.md)               | Зеркало Gitflic                                          |
| [notes-blur-production.md](./notes-blur-production.md) | `cssMinify: false` — не менять                           |

> `perimeter-edge-security.md`, `security-audit-2026-07.md`, `budget-costs.md` — в `.gitignore` (infra-only).

---

## Безопасность и формы

| Документ                                                       | Описание                           |
| -------------------------------------------------------------- | ---------------------------------- |
| [forms.md](./forms.md)                                         | Callback, gift, review, rate-limit |
| [security-baseline-package.md](./security-baseline-package.md) | Этапы hardening                    |
| [legal-pages-review.md](./legal-pages-review.md)               | `/privacy`, `/terms`, cookie       |

---

## SEO, контент, тесты

| Документ                                                       | Описание                   |
| -------------------------------------------------------------- | -------------------------- |
| [technical-audit-checklist.md](./technical-audit-checklist.md) | CWV, SEO, техдолг          |
| [SEO-чек-лист.md](./SEO-чек-лист.md)                           | SEO чеклист                |
| [testing-plan.md](./testing-plan.md)                           | Playwright + Lighthouse CI |
| [refactoring-plan.md](./refactoring-plan.md)                   | Статус рефакторинга        |
| [max-blog-import-plan.md](./max-blog-import-plan.md)           | Импорт MAX → черновики     |

---

## UI / навигация

| Документ                                               | Описание              |
| ------------------------------------------------------ | --------------------- |
| [header-frozen.md](./header-frozen.md)                 | **Хедер заморожен**   |
| [header-anchor-scroll.md](./header-anchor-scroll.md)   | Якоря и scroll-mt     |
| [mobile-menu.md](./mobile-menu.md)                     | Drawer (часть хедера) |
| [responsive-adaptation.md](./responsive-adaptation.md) | Адаптив               |

---

## Дорожные карты

| Документ                                                           | Описание                |
| ------------------------------------------------------------------ | ----------------------- |
| [commercial-resource-roadmap.md](./commercial-resource-roadmap.md) | Коммерческое развитие   |
| [pwa-plan.md](./pwa-plan.md)                                       | PWA (SW — отложено)     |
| [nemo-flights-widget-plan.md](./nemo-flights-widget-plan.md)       | Nemo авиа ✅ на главной |

---

## Архив

Устаревшие документы: **[`_archive/`](./_archive/README.md)** (5 файлов, перенесены 2026-09-07).

Живой аудит апреля 2026 → `_archive/audit-full-2026-04.md`; актуальный — `audit-2026-09-full.md`.

---

## Вне git (локально / infra)

`server-vps-stack-plan.md` в whitelist `.gitignore` — в репозитории.  
Не в git: `deploy-prep-checklist` secrets-части, `budget-costs`, часть security-планов — см. `.gitignore`.
