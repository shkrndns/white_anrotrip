# Документация проекта (`.doc/`)

> ## ⚠️ План аудита не завершён
>
> Пауза **2026-09-07**. Этапы 0–5 ✅ в репо; этап 6 и деплой — впереди.  
> **[audits/AUDIT-PLAN-STATUS.md](./audits/AUDIT-PLAN-STATUS.md)** · журнал: [audits/audit-2026-09-full.md](./audits/audit-2026-09-full.md)

> **Актуально:** сентябрь 2026  
> Конституция: `.specify/memory/constitution.md` · для агентов: **`AGENTS.md`** · архитектура: **[architecture/architecture-reference.md](./architecture/architecture-reference.md)**

---

## Структура папок

| Папка                              | Содержание                             |
| ---------------------------------- | -------------------------------------- |
| [`architecture/`](./architecture/) | Стек, `src/lib/`, middleware, виджеты  |
| [`audits/`](./audits/)             | Аудиты, статус плана, мобильный аудит  |
| [`blog/`](./blog/)                 | Журнал «Наш блог», импорт MAX          |
| [`content/`](./content/)           | Контент-стратегия, семантика, тексты   |
| [`deploy/`](./deploy/)             | VPS, Docker, Caddy, деплой, Gitflic    |
| [`design/`](./design/)             | Дизайн-оверхол и отчёты (архивные)     |
| [`forms/`](./forms/)               | Формы, legal, cookie / аналитика       |
| [`navigation/`](./navigation/)     | Хедер, drawer, адаптив                 |
| [`roadmaps/`](./roadmaps/)         | Дорожные карты, PWA, Nemo, рефакторинг |
| [`security/`](./security/)         | Security baseline, hardening, аудит    |
| [`seo/`](./seo/)                   | SEO-чеклисты, техаудит CWV             |
| [`testing/`](./testing/)           | Playwright, Lighthouse CI              |
| [`meta/`](./meta/)                 | Agent skills, служебные списки         |
| [`_archive/`](./_archive/)         | Устаревшие документы                   |

**Команды качества:** `pnpm check` · `pnpm lint` · `pnpm test:e2e` · `pnpm spellcheck`

---

## Старт здесь

| Документ                                                                           | Когда читать                                  |
| ---------------------------------------------------------------------------------- | --------------------------------------------- |
| **[audits/AUDIT-PLAN-STATUS.md](./audits/AUDIT-PLAN-STATUS.md)**                   | **⚠️ План аудита не закончен — статус паузы** |
| [audits/audit-2026-09-full.md](./audits/audit-2026-09-full.md)                     | Полный аудит + журнал этапов 0–5              |
| [architecture/architecture-reference.md](./architecture/architecture-reference.md) | Astro 7, middleware, `src/lib/`, NAP          |
| [roadmaps/project-roadmap.md](./roadmaps/project-roadmap.md)                       | Фазы проекта (чекбоксы)                       |
| [forms/forms.md](./forms/forms.md)                                                 | Формы, API, `.env`, 152-ФЗ                    |

---

## architecture/

| Документ                                                              | Описание                     |
| --------------------------------------------------------------------- | ---------------------------- |
| [architecture-reference.md](./architecture/architecture-reference.md) | Канон архитектуры приложения |

---

## audits/

| Документ                                                | Описание                   |
| ------------------------------------------------------- | -------------------------- |
| [AUDIT-PLAN-STATUS.md](./audits/AUDIT-PLAN-STATUS.md)   | Статус паузы плана аудита  |
| [audit-2026-09-full.md](./audits/audit-2026-09-full.md) | Полный аудит сентябрь 2026 |
| [audit-mobile.md](./audits/audit-mobile.md)             | Мобильный аудит            |

---

## blog/

| Документ                                                  | Описание                                          |
| --------------------------------------------------------- | ------------------------------------------------- |
| [blog-journal-guide.md](./blog/blog-journal-guide.md)     | **Журнал «Наш блог»:** файлы, скрипты, публикация |
| [max-blog-import-plan.md](./blog/max-blog-import-plan.md) | План импорта MAX → черновики                      |

---

## content/

| Документ                                                   | Описание                     |
| ---------------------------------------------------------- | ---------------------------- |
| [Контент-стратегия.md](./content/Контент-стратегия.md)     | Контент-план блога           |
| [Семантическое-ядро.md](./content/Семантическое-ядро.md)   | Кластеры ключевых слов       |
| [Анализ-текста-сайта.md](./content/Анализ-текста-сайта.md) | Читаемость, SEO, типографика |

---

## deploy/

| Документ                                                          | Описание                       |
| ----------------------------------------------------------------- | ------------------------------ |
| [server-vps-stack-plan.md](./deploy/server-vps-stack-plan.md)     | Beget VPS, Docker, Caddy, GHCR |
| [deploy-prep-checklist.md](./deploy/deploy-prep-checklist.md)     | Подготовка к первому деплою    |
| [gitflic-mirror.md](./deploy/gitflic-mirror.md)                   | Зеркало Gitflic                |
| [notes-blur-production.md](./deploy/notes-blur-production.md)     | `cssMinify: false` — не менять |
| [vps-plan-justification.md](./deploy/vps-plan-justification.md)   | Обоснование тарифа Beget       |
| [budget-costs.md](./deploy/budget-costs.md)                       | Смета затрат                   |
| [perimeter-edge-security.md](./deploy/perimeter-edge-security.md) | Периметр, DNS, DDoS            |

---

## design/

| Документ                                                    | Описание               |
| ----------------------------------------------------------- | ---------------------- |
| [design-overhaul-2026.md](./design/design-overhaul-2026.md) | Дизайн-оверхол (архив) |
| [design-report-2026.md](./design/design-report-2026.md)     | Дизайн-отчёт (архив)   |

---

## forms/

| Документ                                                       | Описание                           |
| -------------------------------------------------------------- | ---------------------------------- |
| [forms.md](./forms/forms.md)                                   | Callback, gift, review, rate-limit |
| [legal-pages-review.md](./forms/legal-pages-review.md)         | `/privacy`, `/terms`, cookie       |
| [analytics-cookies-plan.md](./forms/analytics-cookies-plan.md) | Яндекс Метрика, cookie             |

---

## navigation/

| Документ                                                          | Описание              |
| ----------------------------------------------------------------- | --------------------- |
| [header-frozen.md](./navigation/header-frozen.md)                 | **Хедер заморожен**   |
| [header-anchor-scroll.md](./navigation/header-anchor-scroll.md)   | Якоря и scroll-mt     |
| [mobile-menu.md](./navigation/mobile-menu.md)                     | Drawer (часть хедера) |
| [responsive-adaptation.md](./navigation/responsive-adaptation.md) | Адаптив               |

---

## roadmaps/

| Документ                                                                    | Описание                |
| --------------------------------------------------------------------------- | ----------------------- |
| [project-roadmap.md](./roadmaps/project-roadmap.md)                         | Главный план действий   |
| [commercial-resource-roadmap.md](./roadmaps/commercial-resource-roadmap.md) | Коммерческое развитие   |
| [pwa-plan.md](./roadmaps/pwa-plan.md)                                       | PWA (SW — отложено)     |
| [nemo-flights-widget-plan.md](./roadmaps/nemo-flights-widget-plan.md)       | Nemo авиа ✅ на главной |
| [refactoring-plan.md](./roadmaps/refactoring-plan.md)                       | Статус рефакторинга     |

---

## security/

| Документ                                                                      | Описание                  |
| ----------------------------------------------------------------------------- | ------------------------- |
| [security-baseline-package.md](./security/security-baseline-package.md)       | Этапы hardening           |
| [security-hardening-checklist.md](./security/security-hardening-checklist.md) | Полный чеклист + конфиги  |
| [security-audit-2026-07.md](./security/security-audit-2026-07.md)             | Security-аудит приложения |

---

## seo/

| Документ                                                           | Описание              |
| ------------------------------------------------------------------ | --------------------- |
| [SEO-чек-лист.md](./seo/SEO-чек-лист.md)                           | SEO чеклист           |
| [technical-audit-checklist.md](./seo/technical-audit-checklist.md) | CWV, UX, SEO, техдолг |

---

## testing/

| Документ                                     | Описание                   |
| -------------------------------------------- | -------------------------- |
| [testing-plan.md](./testing/testing-plan.md) | Playwright + Lighthouse CI |

---

## meta/

| Документ                                                            | Описание                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [skills-primary-shortlists.md](./meta/skills-primary-shortlists.md) | Agent skills ([skills.sh](https://www.skills.sh/)); `pnpm skills:install` |
| [cursor-remote-control.md](./meta/cursor-remote-control.md)         | Cursor Remote Control (телефон → агент на ПК)                             |

---

## Архив

Устаревшие документы: **[`_archive/`](./_archive/README.md)**.

Живой аудит апреля 2026 → `_archive/audit-full-2026-04.md`; актуальный — `audits/audit-2026-09-full.md`.

---

## Git и `.gitignore`

Папка `.doc/` в основном **локальная** (infra, сметы, security). В git попадают только файлы из whitelist в корневом `.gitignore` — пути обновлены под новую структуру папок.
