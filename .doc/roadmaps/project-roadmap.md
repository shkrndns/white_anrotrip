# Дорожная карта проекта ANRO TRIP

> **Актуально на:** сентябрь 2026  
> Статусы: ✅ Готово | 🔄 В процессе | ⬜ Запланировано | ❌ Отложено  
> **⚠️ План аудита не завершён** — [AUDIT-PLAN-STATUS.md](../audits/AUDIT-PLAN-STATUS.md) (пауза 2026-09-07)  
> Полный аудит и журнал: [audit-2026-09-full.md](../audits/audit-2026-09-full.md)

---

## Фаза 0: Фундамент (ЗАВЕРШЕНА) ✅

- [x] Astro 7 + Tailwind 4 + TypeScript strict
- [x] Главная страница (все секции)
- [x] `/cabinet`, `/terms`, `/privacy`, `/404`
- [x] Блог (SSR, 7+ статей)
- [x] Формы (callback, gift, review) + SMTP + Telegram
- [x] Docker + GitHub Actions CI/CD + health-gate
- [x] Caddy + HTTPS конфиг
- [x] Зеркало Gitflic
- [x] `/corp` — **архивирован** (`src/_archive/corp/`, маршрут не публикуется)

---

## Фаза 1: Оптимизация и SEO 🔄

- [x] Локальные шрифты (cyrillic + latin subset)
- [x] Sharp / WebP, `pnpm optimize:images`
- [x] Typograf (rehype + blog script)
- [x] `@astrojs/sitemap`, robots.txt
- [x] OpenGraph, Schema.org, canonical (Layout)
- [x] Nemo lazy + preconnect; Hero LCP
- [x] Font Awesome → astro-iconify
- [x] PWA icons + site.webmanifest
- [ ] SEO-чек-лист — см. [SEO-чек-лист.md](../seo/SEO-чек-лист.md) (контентные пункты)
- [ ] Core Web Vitals на реальном проде (после деплоя VPS)

---

## Фаза 2: Деплой на Beget VPS ⬜

> [deploy-prep-checklist.md](../deploy/deploy-prep-checklist.md)

- [ ] VPS, UFW, SSH, fail2ban
- [ ] Первый деплой через Actions
- [ ] DNS anrotrip.ru → VPS
- [ ] Smoke форм на проде

---

## Фаза 3: Безопасность 🔄

- [x] CSP, HSTS, rate-limit, honeypot, allowedDomains, bodySizeLimit 64KB
- [ ] UFW/SSH/fail2ban на VPS — см. [security-hardening-checklist.md](../security/security-hardening-checklist.md)

---

## Фаза 4: Nemo Авиа ✅ (виджет на главной)

- [x] NemoSearch + SearchWidget + тема ANRO TRIP
- [ ] Поддомен ticket/b2b после деплоя — см. [nemo-flights-widget-plan.md](./nemo-flights-widget-plan.md)

---

## Фаза 5: PWA 🔄

- [x] Manifest + иконки 180/192/512
- [ ] Service worker — см. [pwa-plan.md](./pwa-plan.md)

---

## Фаза 6: Рефакторинг и качество ✅

- [x] Data layer, form-submit, client modules, SectionHeading
- [x] Playwright smoke + Lighthouse CI + lint/format/spellcheck
- [x] Mailer split, env.ts, Reviews/About/blog split
- [ ] Header split — только по согласованию (frozen)

---

## Фаза 7–8: Контент и коммерция ⬜

См. [Контент-стратегия.md](../content/Контент-стратегия.md), [commercial-resource-roadmap.md](./commercial-resource-roadmap.md)

---

## Связанные документы

| Документ                                                               | Фаза        |
| ---------------------------------------------------------------------- | ----------- |
| [architecture-reference.md](../architecture/architecture-reference.md) | Архитектура |
| [refactoring-plan.md](./refactoring-plan.md)                           | Фаза 6      |
| [testing-plan.md](../testing/testing-plan.md)                          | Фаза 6      |
