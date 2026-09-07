# PWA: план внедрения

> **Статус:** Запланировано (Фаза 5)

---

## Цель

Превратить сайт anrotrip.ru в Progressive Web App:

- Add to Home Screen (iPhone / Android)
- Кэширование статики (быстрый повторный вход)
- Оффлайн-страница при потере сети

---

## Этапы

### 1. Иконки

- [ ] Создать `icon-192.png` (192×192)
- [ ] Создать `icon-512.png` (512×512)
- [ ] Создать `icon-maskable-512.png` (maskable, с safe zone)
- [ ] Разместить в `public/`
- [ ] Apple touch icon: `apple-touch-icon.png` 180×180

### 2. Web App Manifest

- [ ] Создать `public/manifest.webmanifest`:

```json
{
	"name": "ANRO TRIP — Путешествия и командировки",
	"short_name": "ANRO TRIP",
	"start_url": "/",
	"display": "standalone",
	"background_color": "#ffffff",
	"theme_color": "#00abb3",
	"icons": [
		{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
		{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
		{
			"src": "/icon-maskable-512.png",
			"sizes": "512x512",
			"type": "image/png",
			"purpose": "maskable"
		}
	]
}
```

- [ ] Добавить `<link rel="manifest">` в Layout.astro
- [ ] Добавить `<meta name="theme-color">` в Layout.astro

### 3. Service Worker

- [ ] Создать `public/sw.js`
- [ ] Стратегия: Cache First для статики (CSS, JS, шрифты, изображения)
- [ ] Network First для HTML (всегда свежий контент)
- [ ] Регистрация в Layout.astro (только `NODE_ENV === 'production'`)

### 4. Оффлайн-страница

- [ ] Создать `src/pages/offline.astro`
- [ ] Кэшировать в Service Worker при установке
- [ ] Показывать при `fetch failed` для navigation requests

### 5. Проверка

- [ ] Lighthouse PWA audit: 100/100
- [ ] Chrome DevTools → Application → Manifest
- [ ] iPhone Safari: Add to Home Screen
- [ ] Android Chrome: Install app

---

## Связанные документы

| Документ                                     | Содержание |
| -------------------------------------------- | ---------- |
| [project-roadmap.md](./project-roadmap.md)   | Фаза 5     |
| [budget-costs.md](../deploy/budget-costs.md) | Смета PWA  |
