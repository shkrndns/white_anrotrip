# Технический аудит сайта — чеклист ANRO TRIP

> Методология: [статья Аспро на Habr «Технический аудит сайта»](https://habr.com/ru/companies/aspro/articles/1071700/) (август 2026).  
> Адаптировано под **anrotrip.ru** и стек проекта (Astro SSR, Caddy, Tailwind v4).

Один набор проверок одновременно влияет на **четырёх читателей** сайта:

| Читатель                                       | Что решает                                |
| ---------------------------------------------- | ----------------------------------------- |
| Человек                                        | Досидит ли до загрузки, оформит ли заявку |
| Поисковый робот                                | Найдёт и проиндексирует ли страницу       |
| Алгоритм ранжирования                          | Попадёт ли страница в топ                 |
| Краулер нейросети (ChatGPT, Алиса, Perplexity) | Процитирует ли сайт в ответе              |

Разделять эти каналы и чинить их отдельно — тратить ресурс дважды на одну техническую причину.

---

## Core Web Vitals (Google)

Скорость формализована в три метрики. Считаются по **75-му перцентилю** реальных загрузок Chrome (CrUX), **отдельно mobile и desktop**. Хороший результат в PageSpeed Insights на офисном Wi‑Fi не гарантирует «зелёную» зону в Search Console.

| Метрика                             | Что измеряет                                     | Хорошо    | Нужно улучшить | Плохо    |
| ----------------------------------- | ------------------------------------------------ | --------- | -------------- | -------- |
| **LCP** (Largest Contentful Paint)  | Скорость отрисовки крупнейшего видимого элемента | ≤ 2,5 сек | 2,5–4 сек      | > 4 сек  |
| **INP** (Interaction to Next Paint) | Отклик на клик, тап, ввод                        | ≤ 200 мс  | 200–500 мс     | > 500 мс |
| **CLS** (Cumulative Layout Shift)   | «Прыжки» вёрстки при загрузке                    | ≤ 0,1     | 0,1–0,25       | > 0,25   |

**Связь с конверсией:** каждая секунда ожидания — окно, в которое пользователь может закрыть вкладку. CLS > 0,25 — риск промаха по кнопке «Оставить заявку».

**На anrotrip.ru основные риски LCP/INP:** Hero-изображение, виджеты Nemo/Tourvisor (iframe/скрипты), ClientRouter (View Transitions). Подробнее: [site-analysis-full.md](../_archive/site-analysis-full.md), [audit-full-2026-04.md](../_archive/audit-full-2026-04.md).

---

## Сводка по блокам статьи

| Блок статьи                               | В проекте        | Комментарий                                            |
| ----------------------------------------- | ---------------- | ------------------------------------------------------ |
| **1. UX и конверсия (CWV)**               | ⚠️ Частично      | Фундамент хороший, LCP/INP под ударом виджетов         |
| **2. Поиск (robots, sitemap, canonical)** | ✅ В основном да | Автогенерация, canonical, OG                           |
| **3. Видимость в ИИ (GEO/AEO)**           | ⚠️ Частично      | FAQPage есть; BlogPosting и формат 40–60 слов — нет    |
| **4. Техдолг (картинки, кеш, скрипты)**   | ⚠️ Частично      | WebP/lazy ✅; Cache-Control и Tourvisor — слабые места |

**Вывод:** база из статьи в коде есть; волна 1 до деплоя закрыта в коде. Остаётся: верификация Search Console/Вебмастера (коды в `.env`), baseline CrUX после деплоя, HowTo, локальное SEO.

---

## Волна 1 — до деплоя (август 2026)

> Реализовано в коде. Проверка на проде — после деплоя на VPS.

### ✅ Сделано

| Задача                                                | Файлы                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Cache-Control` для `/_astro/*` и публичной статики   | `Caddyfile`                                                                                            |
| Кастомная страница 404                                | `src/pages/404.astro`                                                                                  |
| JSON-LD **BlogPosting** на статьях блога              | `src/lib/schema-blog.ts`, `src/pages/blog/[...slug].astro`                                             |
| JSON-LD **BreadcrumbList** на блоге и статьях         | `src/lib/schema-blog.ts`, `src/pages/blog/[...page].astro`, `[...slug].astro`                          |
| FAQ: прямой ответ **40–60 слов** (`summary`) + детали | `src/components/FAQ.astro`                                                                             |
| Meta `geo.region` (RU-SVE)                            | `src/layouts/Layout.astro`                                                                             |
| Meta-теги верификации (через env)                     | `Layout.astro`, `.env.example` → `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_YANDEX_VERIFICATION`       |
| Tourvisor без блокировки первого экрана               | `SearchWidget.astro` (lazy при вкладке); legacy `TourvisorSearch.astro` — defer + IntersectionObserver |
| Убран лишний вызов `initTourvisorWidget` из Layout    | `src/layouts/Layout.astro`                                                                             |

### ⬜ Осталось после волны 1

| Задача                                      | Кто / когда                                                  |
| ------------------------------------------- | ------------------------------------------------------------ |
| Заполнить коды верификации в `.env` на VPS  | Владелец → Search Console, Яндекс.Вебмастер                  |
| PageSpeed Insights + Lighthouse baseline    | После деплоя → [testing-plan.md](../testing/testing-plan.md) |
| CrUX в Search Console (field data)          | После деплоя + 28 дней трафика                               |
| Rich Results Test для BlogPosting/FAQ       | После деплоя, вручную                                        |
| Schema.org **HowTo** для пошаговых статей   | Следующая итерация                                           |
| E-E-A-T: автор-эксперт, источники в статьях | Контент + BlogPosting UI                                     |
| Яндекс.Бизнес, 2GIS, Google Business        | P5, заказчик                                                 |
| Сравнение скорости с Яндекс.Метрикой        | После подключения Метрики на проде                           |

---

## Приоритетный backlog (полный)

Легенда: ✅ уже в коде · ⚠️ частично / риск · ⬜ не сделано · 🔍 процесс / вне кода

### P0 — сначала измерить (baseline)

Без baseline нельзя понять, какие 3 пункта дают 80% эффекта.

- [ ] 🔍 PageSpeed Insights: `/`, `/blog`, `/cabinet`, одна статья блога — **отдельно mobile и desktop**
- [ ] 🔍 Google Search Console → Core Web Vitals (field data, 75-й перцентиль)
- [ ] 🔍 Яндекс.Вебмастер: индексация, `robots.txt`, sitemap, видимость в Алисе
- [ ] 🔍 Зафиксировать целевые пороги: LCP ≤ 2,5 сек · INP ≤ 200 мс · CLS ≤ 0,1
- [ ] 🔍 Проверка на реальном телефоне через мобильный интернет (не Wi‑Fi): Hero, поиск, формы, блог
- [ ] 🔍 Lighthouse после деплоя по [testing-plan.md](../testing/testing-plan.md) (Performance ≥ 90)

### P1 — критично: скорость и конверсия

| #   | Задача                                           | Статус | Где / как                                                                                                          |
| --- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | LCP / INP / CLS не в «красной» зоне              | ⬜     | CrUX или PSI mobile                                                                                                |
| 2   | `Cache-Control` для статики                      | ✅     | `Caddyfile`: `/_astro/*`, `/og-image.jpg`, `/nemo/*`                                                               |
| 3   | Tourvisor — отложенная загрузка                  | ✅     | `SearchWidget.astro` (вкладка); `TourvisorSearch.astro` (legacy)                                                   |
| 4   | Nemo — не блокирует первый экран                 | ⚠️     | `NemoSearch.astro`: `defer` ✅; проверить Network                                                                  |
| 5   | Hero — главный LCP-элемент                       | ✅     | `index.astro`: preload + `fetchpriority="high"`                                                                    |
| 6   | CLS: размеры и `sizes` у картинок                | ⚠️     | `astro:assets`; проверить динамические блоки                                                                       |
| 7   | Формы: callback, gift, review                    | ✅     | Zod, honeypot, rate-limit, Origin-check → [forms.md](../forms/forms.md)                                            |
| 8   | Поиск туров открывается и работает               | ⚠️     | Nemo + Tourvisor — smoke после деплоя                                                                              |
| 9   | Мобильная адаптация на 4G                        | ⚠️     | → [responsive-adaptation.md](../navigation/responsive-adaptation.md), [audit-mobile.md](../audits/audit-mobile.md) |
| 10  | ClientRouter (View Transitions) — влияние на INP | ⚠️     | `Layout.astro`; оценить необходимость на всех страницах                                                            |

**Связь с конверсией (из статьи):** каждая секунда ожидания — риск закрытия вкладки; CLS > 0,25 — промах по кнопке заявки.

### P2 — позиции в поиске

| #   | Задача                                      | Статус | Где / как                                                            |
| --- | ------------------------------------------- | ------ | -------------------------------------------------------------------- |
| 1   | `robots.txt` не закрывает нужное            | ✅     | `public/robots.txt`; `/api/`, `/cabinet` закрыты                     |
| 2   | Sitemap актуален                            | ✅     | `astro-sitemap` → `sitemap-index.xml`                                |
| 3   | Canonical без дублей                        | ✅     | `Layout.astro`; проверить в Search Console после индексации          |
| 4   | OpenGraph / Twitter Card                    | ✅     | `Layout.astro`                                                       |
| 5   | Семантический HTML, title, description      | ✅     | Все страницы                                                         |
| 6   | HTTPS + gzip                                | ✅     | Caddy                                                                |
| 7   | Кастомная 404                               | ✅     | `src/pages/404.astro`                                                |
| 8   | Google Search Console — верификация         | ⚠️     | Meta в `Layout.astro`; нужен код в `PUBLIC_GOOGLE_SITE_VERIFICATION` |
| 9   | Яндекс.Вебмастер — верификация              | ⚠️     | Meta в `Layout.astro`; нужен код в `PUBLIC_YANDEX_VERIFICATION`      |
| 10  | Проверка дублей в Search Console            | ⬜     | После индексации                                                     |
| 11  | `<meta name="geo.region" content="RU-SVE">` | ✅     | `Layout.astro`                                                       |

Подробный SEO-чеклист: [SEO-чек-лист.md](./SEO-чек-лист.md).

### P3 — видимость в ИИ-ответах (GEO / AEO)

| #   | Задача                               | Статус | Где / как                                                |
| --- | ------------------------------------ | ------ | -------------------------------------------------------- |
| 1   | JSON-LD TravelAgency + LocalBusiness | ✅     | `Layout.astro`                                           |
| 2   | JSON-LD FAQPage                      | ✅     | `FAQ.astro`                                              |
| 3   | JSON-LD BlogPosting                  | ✅     | `src/lib/schema-blog.ts`, `[...slug].astro`              |
| 4   | JSON-LD HowTo                        | ⬜     | Пошаговые статьи блога                                   |
| 5   | JSON-LD QAPage                       | ⬜     | При необходимости для Q&A-материалов                     |
| 6   | BreadcrumbList                       | ✅     | Блог и статьи                                            |
| 7   | Ответ **40–60 слов** под вопросом    | ✅     | FAQ: поле `summary` в `FAQ.astro`                        |
| 8   | E-E-A-T: автор с ролью/экспертностью | ⚠️     | `content.config.ts`: `author` есть; в JSON-LD и UI — нет |
| 9   | E-E-A-T: источники, даты обновления  | ⬜     | `updatedDate` в frontmatter; ссылки на первоисточники    |
| 10  | Rich Results Test без ошибок         | 🔍     | После каждого изменения JSON-LD                          |
| 11  | Яндекс.Вебмастер → видимость в Алисе | ⬜     | После верификации                                        |

**Формат контента для цитирования:** заголовок-вопрос → первый абзац с прямым ответом (40–60 слов) → детали ниже.

### P4 — технический долг (ускоряет все каналы)

| #   | Задача                               | Статус | Где / как                                            |
| --- | ------------------------------------ | ------ | ---------------------------------------------------- |
| 1   | WebP/AVIF + Sharp                    | ✅     | `astro:assets`; `pnpm optimize:images`               |
| 2   | Lazy-load ниже первого экрана        | ✅     | Большинство `<Image />`                              |
| 3   | Preload / fetchpriority для LCP      | ✅     | Hero, первые карточки туров                          |
| 4   | Локальные шрифты без Google CDN      | ✅     | `@fontsource`                                        |
| 5   | Тяжёлые изображения — аудит Network  | 🔍     | DevTools → сортировка по размеру                     |
| 6   | Сторонние скрипты: async/defer       | ✅     | Nemo `defer`; Tourvisor lazy                         |
| 7   | `Cache-Control` на edge              | ✅     | `Caddyfile`                                          |
| 8   | Лишний JS — Coverage                 | 🔍     | DevTools → Coverage; ClientRouter, виджеты           |
| 9   | Не добавлять библиотеки «на будущее» | 🔍     | Правило для ревью PR                                 |
| 10  | Security-заголовки                   | ✅     | `src/middleware.ts`, `Caddyfile`                     |
| 11  | Honeypot + rate-limit на формах      | ✅     | API + [forms.md](../forms/forms.md)                  |
| 12  | Origin-check на API-формах           | ✅     | `src/lib/security.ts`                                |
| 13  | Сравнение скорости с Метрикой        | 🔍     | Отказы, скроллы, отправки форм vs медленные страницы |

### P5 — локальное SEO (вне кода, но из SEO-стратегии)

- [ ] Яндекс.Бизнес (Справочник)
- [ ] Google Business Profile
- [ ] 2GIS (Екатеринбург, Челябинск)
- [ ] Tutu.ru, TOURindex.ru — туристические каталоги

→ [SEO-чек-лист.md](./SEO-чек-лист.md) → «Локальное SEO»

---

## Рекомендуемый порядок работ

**Волна 1 (код) — выполнена.** Дальше:

1. **Деплой** на VPS → [deploy-prep-checklist.md](../deploy/deploy-prep-checklist.md)
2. **Коды верификации** в `.env`: `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_YANDEX_VERIFICATION`
3. **PageSpeed / Lighthouse** — baseline после деплоя
4. **Rich Results Test** — BlogPosting и FAQPage
5. **HowTo** для подходящих статей блога
6. **E-E-A-T** — автор, источники, `updatedDate` в контенте
7. **Локальное SEO** (P5) — Яндекс.Бизнес, 2GIS

---

## Чеклист по блокам (краткий)

### Блок 1 — опыт и конверсия (критично)

- [ ] LCP / INP / CLS не в «красной» зоне (CrUX или PageSpeed Insights mobile)
- [ ] Формы заявок работают: обратный звонок, подарок, отзыв → [forms.md](../forms/forms.md)
- [ ] Поиск туров (Nemo / Tourvisor) открывается и не блокирует страницу
- [ ] Мобильная адаптация на реальном 4G → [responsive-adaptation.md](../navigation/responsive-adaptation.md)

### Блок 2 — позиции в поиске

| Проверка                   | Статус ANRO TRIP                    |
| -------------------------- | ----------------------------------- |
| `robots.txt`               | ✅                                  |
| `sitemap.xml`              | ✅                                  |
| Canonical                  | ✅                                  |
| OpenGraph / Twitter Card   | ✅                                  |
| Search Console / Вебмастер | ⚠️ meta готовы, нужны коды в `.env` |
| Кастомная 404              | ✅                                  |

### Блок 3 — видимость в ИИ-ответах

| Требование                   | Статус ANRO TRIP                          |
| ---------------------------- | ----------------------------------------- |
| FAQPage JSON-LD              | ✅                                        |
| BlogPosting / BreadcrumbList | ✅ BlogPosting + BreadcrumbList; HowTo ⬜ |
| Ответ 40–60 слов             | ✅ FAQ `summary`                          |
| E-E-A-T                      | ⬜                                        |
| Видимость в Алисе            | ⬜                                        |

### Блок 4 — технический долг

| Проблема              | Статус ANRO TRIP |
| --------------------- | ---------------- |
| Изображения WebP/lazy | ✅               |
| Cache-Control         | ✅               |
| Tourvisor defer       | ✅               |
| Лишний JS             | ⚠️               |

---

## Самостоятельная проверка (~20 минут)

| Инструмент                                                              | Что даёт                                                    |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| [PageSpeed Insights](https://pagespeed.web.dev)                         | LCP, INP, CLS (lab + field при наличии CrUX) + рекомендации |
| Google Search Console → Core Web Vitals                                 | Реальные данные пользователей за месяцы                     |
| [Яндекс.Вебмастер](https://webmaster.yandex.ru)                         | Индексация, robots/sitemap, видимость в Алисе               |
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Валидность JSON-LD без синтаксических ошибок                |
| Chrome DevTools → Network / Coverage                                    | Размер ресурсов, неиспользуемый JS                          |

**Приоритизация:** список из 40 предупреждений PageSpeed бесполезен без выбора **3 пунктов, дающих ~80% эффекта**. Сначала mobile LCP и блокирующие скрипты, затем индексация, затем разметка для ИИ.

После деплоя — Lighthouse по [testing-plan.md](../testing/testing-plan.md) (Performance ≥ 90).

---

## ANRO TRIP: что уже закрыто из коробки

| Область     | Реализовано                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| Изображения | WebP/AVIF через `astro:assets` + Sharp; lazy-load; Hero preload/fetchpriority |
| Шрифты      | `@fontsource` локально, без Google CDN                                        |
| SEO-база    | Sitemap (`astro-sitemap`), `robots.txt`, canonical, OpenGraph, Twitter Card   |
| Schema.org  | TravelAgency + LocalBusiness + FAQPage + BlogPosting + BreadcrumbList         |
| Инфра       | HTTPS, gzip, Cache-Control (`Caddyfile`)                                      |
| Формы       | Zod, honeypot, rate-limit, Origin-check (`security.ts`), safe API errors      |
| Security    | CSP middleware, security-заголовки в Caddy                                    |
| Astro       | SSR, минимум клиентского JS                                                   |

**Ограничение:** `cssMinify: false` в Vite — **не менять** (blur в production): [notes-blur-production.md](../deploy/notes-blur-production.md)

**Основные риски (после волны 1):** CrUX не подтверждён; коды Search Console/Вебмастера не заданы; HowTo и E-E-A-T в блоге; локальное SEO (P5).

---

## Связанные документы

| Документ                                                   | Содержание                                    |
| ---------------------------------------------------------- | --------------------------------------------- |
| [SEO-чек-лист.md](./SEO-чек-лист.md)                       | Технический и контентный SEO, локальное SEO   |
| [testing-plan.md](../testing/testing-plan.md)              | Lighthouse, E2E форм, smoke-тесты             |
| [audit-full-2026-04.md](../_archive/audit-full-2026-04.md) | Снимок аудита (апрель 2026)                   |
| [site-analysis-full.md](../_archive/site-analysis-full.md) | Детальный анализ страниц и Lighthouse (архив) |
| [project-roadmap.md](../roadmaps/project-roadmap.md)       | Дорожная карта: SEO, PWA, деплой              |
