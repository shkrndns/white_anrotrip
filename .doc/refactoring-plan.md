# Рефакторинг: анализ кода и приоритеты

> **Статус:** Фаза 6 — **основное выполнено** (сентябрь 2026)  
> **Обновлено:** 2026-09-07 · журнал: [audit-2026-09-full.md](./audit-2026-09-full.md) этапы 3–4

---

## Выполнено (этапы 3–4)

| Задача                                    | Результат                                                         |
| ----------------------------------------- | ----------------------------------------------------------------- |
| form-submit                               | `src/lib/client/form-submit.ts`                                   |
| scroll-lock, smooth-scroll, scroll-reveal | `src/lib/client/*.ts`                                             |
| Data layer                                | `src/data/*.ts` (10 файлов)                                       |
| SectionHeading                            | `ui/SectionHeading.astro`                                         |
| Reviews split                             | `reviews/ReviewsLightbox`, `ReviewFormOverlay`                    |
| About split                               | `about/About*.astro`                                              |
| Blog split                                | `blog/Blog*.astro`                                                |
| Mailer split                              | `mail-transport`, `mail-telegram`, `mail-templates`, `rate-limit` |
| is:inline → bundled                       | client modules                                                    |
| Quality                                   | lint, prettier, spellcheck, Playwright, Lighthouse CI             |

---

## Крупные компоненты (актуальные размеры)

| Комponent            | Строк (~) | Статус                                            |
| -------------------- | --------- | ------------------------------------------------- |
| `Header.astro`       | ~1230     | **Заморожен** — split только по запросу заказчика |
| `Reviews.astro`      | ~200      | Lightbox + форма вынесены                         |
| `About.astro`        | ~100      | Секции в `about/`                                 |
| `OfficeWidget.astro` | ~600      | —                                                 |
| `Footer.astro`       | ~460      | —                                                 |

---

## Остаётся (низкий приоритет)

- Header split (`MobileDrawer`, `DesktopNav`) — после согласования
- Nonce-CSP вместо `unsafe-inline` — этап 6 аудита, после минимизации inline
- Точечный `@layer components` для повторяющихся паттернов в `global.css`

---

## Связанные документы

| Документ                                                 | Содержание       |
| -------------------------------------------------------- | ---------------- |
| [testing-plan.md](./testing-plan.md)                     | Playwright smoke |
| [architecture-reference.md](./architecture-reference.md) | `src/lib/`       |
