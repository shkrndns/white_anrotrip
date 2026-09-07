# SEO-чек-лист ANRO TRIP

> Технический и контентный SEO для anrotrip.ru.  
> Целевые регионы: Екатеринбург, Россия.

---

## Технический SEO

### Реализовано ✅

- [x] HTTPS (Let's Encrypt через Caddy)
- [x] Sitemap.xml (`astro-sitemap` → `sitemap-index.xml`)
- [x] `robots.txt` — `/api/` и `/cabinet` закрыты; sitemap указан (`public/robots.txt`)
- [x] Canonical URLs (`<link rel="canonical">` в `Layout.astro`)
- [x] OpenGraph (og:title, og:description, og:image, og:url, og:locale)
- [x] Twitter Card (summary_large_image)
- [x] Schema.org TravelAgency + LocalBusiness (филиалы Екб/Челябинск) в `Layout.astro`
- [x] Schema.org FAQPage на главной (`FAQ.astro`)
- [x] Schema.org BlogPosting + BreadcrumbList на блоге (`src/lib/schema-blog.ts`)
- [x] `<meta name="geo.region" content="RU-SVE">` (Екатеринбург)
- [x] Meta-теги верификации Search Console / Вебмастер (через `PUBLIC_*` в `.env`)
- [x] 404 страница (`src/pages/404.astro`)
- [x] FAQ: прямой ответ 40–60 слов (`summary` в `FAQ.astro`)
- [x] Cache-Control статики в Caddy (`Caddyfile`)
- [x] Семантический HTML (header, main, footer, nav, article)
- [x] Уникальные `<title>` на всех страницах
- [x] `<meta name="description">` на всех страницах
- [x] Локальные шрифты (без Google CDN → быстрее, стабильнее)
- [x] WebP/AVIF изображения
- [x] Gzip сжатие (Caddy)
- [x] Типографика (typograf — кавычки «ёлочки», тире)
- [x] Мобильная адаптация (mobile-first)
- [x] `viewport` meta тег

### Нужно добавить ⬜

- [ ] Заполнить `PUBLIC_GOOGLE_SITE_VERIFICATION` и `PUBLIC_YANDEX_VERIFICATION` в `.env` на VPS
- [ ] Schema.org HowTo для пошаговых материалов блога
- [ ] Schema.org TouristTrip — если появятся отдельные landing-страницы туров
- [ ] E-E-A-T в статьях: экспертность автора, источники, даты обновления
- [ ] Yandex.Webmaster — подтвердить сайт + отчёт «видимость в Алисе»
- [ ] Google Search Console — подтвердить сайт + Core Web Vitals (field data)

---

## Контентный SEO

### Ключевые страницы

| Страница           | Основной запрос                   | Дополнительные     |
| ------------------ | --------------------------------- | ------------------ |
| `/`                | туристическое агентство Челябинск | туры, путешествия  |
| `#about` (главная) | туры и командировки               | B2B (секция About) |
| `/blog/[slug]`     | зависит от статьи                 | —                  |

### Блог

- 7 статей (2026): египет, мальдивы, сейшелы, таиланд, топ-2026, турция, вьетнам
- Регулярность: 1–2 статьи/месяц
- Подробнее: [Контент-стратегия.md](../content/Контент-стратегия.md)

---

## Локальное SEO

- [ ] Зарегистрировать в Яндекс.Бизнес (ранее Яндекс.Справочник)
- [ ] Google Business Profile
- [ ] 2GIS (Екатеринбург)
- [ ] Tutu.ru, TOURindex.ru — туристические каталоги

---

## Core Web Vitals

Google считает метрики по **75-му перцентилю** реальных пользователей Chrome (CrUX), отдельно mobile/desktop. Lab-тест (PageSpeed Insights, Lighthouse) дополняет, но не заменяет field data в Search Console.

| Метрика | Что измеряет               | Хорошо    | Нужно улучшить | Плохо    | Текущее |
| ------- | -------------------------- | --------- | -------------- | -------- | ------- |
| LCP     | Крупнейший видимый элемент | ≤ 2,5 сек | 2,5–4 сек      | > 4 сек  | ~       |
| INP     | Отклик на клик/тап/ввод    | ≤ 200 мс  | 200–500 мс     | > 500 мс | ~       |
| CLS     | «Прыжки» вёрстки           | ≤ 0,1     | 0,1–0,25       | > 0,25   | ~       |

**Инструменты:** [PageSpeed Insights](https://pagespeed.web.dev), Search Console → Core Web Vitals, Lighthouse CI — см. [testing-plan.md](../testing/testing-plan.md).

**Риски на anrotrip.ru:** Hero (LCP), виджеты Nemo/Tourvisor, ClientRouter (INP).

---

## Видимость в ИИ-ответах (GEO / AEO)

Нейросети (ChatGPT, Яндекс.Алиса, Perplexity) цитируют сайты с машиночитаемой структурой и прямым форматом ответа.

| Требование                                                                            | Статус                                                   |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| JSON-LD Schema.org (FAQPage, BlogPosting, BreadcrumbList)                             | FAQPage ✅; BlogPosting ✅; HowTo ⬜                     |
| Ответ 40–60 слов сразу под вопросом                                                   | ✅ FAQ `summary`                                         |
| E-E-A-T: автор, источники, даты обновления                                            | ⚠️ BlogPosting с автором ✅; экспертность и источники ⬜ |
| Яндекс.Вебмастер → видимость в Алисе                                                  | ⚠️ meta готов; нужен код в `.env`                        |
| [Rich Results Test](https://search.google.com/test/rich-results) — без ошибок JSON-LD | Проверять после изменений разметки                       |

Подробный чеклист по всем четырём каналам (UX, SEO, ИИ, техдолг): [technical-audit-checklist.md](./technical-audit-checklist.md).

**Полный приоритетный backlog** (P0–P5, статусы ✅/⚠️/⬜, порядок работ): [technical-audit-checklist.md](./technical-audit-checklist.md) → «Приоритетный backlog».

---

## Связанные документы

| Документ                                                       | Содержание                                                |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| [technical-audit-checklist.md](./technical-audit-checklist.md) | Технический аудит: CWV, приоритеты, ИИ-видимость, техдолг |
| [Семантическое-ядро.md](../content/Семантическое-ядро.md)      | Ключевые слова                                            |
| [Контент-стратегия.md](../content/Контент-стратегия.md)        | Контент-план                                              |
| [Анализ-текста-сайта.md](../content/Анализ-текста-сайта.md)    | Тексты страниц                                            |
| [audit-full-2026-04.md](../_archive/audit-full-2026-04.md)     | Полный аудит                                              |
