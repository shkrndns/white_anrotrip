# Nemo Авиа: виджет поиска билетов

> **Статус:** ✅ Виджет на главной (2026-09)  
> Компонент: `src/components/widgets/NemoSearch.astro` · конфиг: `src/lib/nemo-config.ts`

---

## Текущее состояние

- [x] `NemoSearch.astro` в `SearchWidget.astro` (вкладка «Авиабилеты»)
- [x] Кастомная тема ANRO TRIP (`public/nemo/anrotrip-widget-theme.css`)
- [x] Lazy-load через `IntersectionObserver` + preconnect к `cdn.nemo.travel`
- [x] Типы Window — `src/env.d.ts`
- [x] Конфиг CDN/booking URL в data-атрибутах `#nemo-root`

---

## После деплоя VPS (опционально)

- [ ] Поддомен `ticket.anrotrip.ru` или `b2b.anrotrip.ru` (DNS + SSL)
- [ ] Тест реальных поисков на production-домене

---

## Связанные документы

| Документ                                                 | Содержание     |
| -------------------------------------------------------- | -------------- |
| [architecture-reference.md](./architecture-reference.md) | Nemo boot, CSP |
| [project-roadmap.md](./project-roadmap.md)               | Фаза 4         |
