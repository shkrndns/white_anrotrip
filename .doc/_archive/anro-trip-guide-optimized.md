# ANRO TRIP — Компактное руководство проекта (2026)

## 📌 БЫСТРЫЙ СТАРТ

**Конституция:** `.specify/memory/constitution.md` — ЧИТАТЬ ПЕРВЫМ ДЕЛОМ!
**Анализ сайта:** `.doc/site-analysis-full.md` — приоритеты, Lighthouse, тесты
**Технологии:** Astro 5.16.13 + Tailwind CSS 4.1.18
**Порт разработки:** http://localhost:4321

### Железные правила

1. **Стилизация ТОЛЬКО через Tailwind CSS**
   - Стандартные утилиты → JIT-синтаксис → Только тогда CSS в `global.css`
   - ❌ Запрещено: новые `.css` файлы, `<style>` блоки в компонентах
   - ✅ Разрешено: `bg-[#hex]`, `shadow-[...]`, `class:list`

2. **Tailwind v4 синтаксис (ВАЖНО!)**
   - `bg-linear-to-r` (НЕ `bg-gradient-to-r`)
   - `z-9999` (НЕ `z-[9999]`)
   - Container Queries: `@container`, `@md:`, `@lg:`

3. **Единственный CSS файл:** `src/styles/global.css`
   - Только для: глобальных утилит, сторонних библиотек, базовых стилей

---

## 🏗️ АРХИТЕКТУРА ПРОЕКТА

### Структура файлов (ключевая)

```
white_anrotrip/
├── .specify/memory/constitution.md
├── src/
│   ├── assets/
│   │   ├── hero/plane.avif
│   │   ├── tours/          # antalya, dubai, thailand, maldives, egypt, vietnam .webp
│   │   ├── awards/         # left_awards, center_awards, right_awards .webp
│   │   ├── certif/         # certif.webp — подарочный сертификат
│   │   ├── partners/       # 10 логотипов партнёров .webp
│   │   ├── corp/           # corp.webp, corp1–4.webp — страница КП
│   │   ├── team/           # 23 фото команды + team.webp (групповое)
│   │   └── welcome/        # welcome.webp — страница Cabinet
│   ├── components/
│   │   ├── Header.astro        # Floating pill nav, scroll shrink
│   │   ├── Hero.astro          # Fullscreen, kenburns, parallax (desktop only)
│   │   ├── SearchWidget.astro  # Табы: Авиабилеты / Туры и Отели
│   │   ├── PopularTours.astro  # Bento grid с реальными фото
│   │   ├── About.astro         # 5 блоков: заявление, услуги, bento, направления, CTA
│   │   ├── Partners.astro      # Marquee (desktop) / grid (mobile)
│   │   ├── Reviews.astro       # Карусель + lightbox + форма отзыва
│   │   ├── Awards.astro        # 3 карточки с реальными фото наград
│   │   ├── GiftSection.astro   # Сертификат с реальным фото certif.webp
│   │   ├── Team.astro          # 3 hero-карточки + раскрываемая сетка команды
│   │   ├── Contacts.astro      # 3 карточки (тёмная / синяя / светлая)
│   │   ├── Footer.astro        # Тёмный, 3 колонки + соцсети
│   │   ├── TrustBadges.astro   # Бейджи доверия
│   │   ├── ScrollProgress.astro
│   │   ├── ui/Modal.astro
│   │   └── widgets/
│   │       ├── NemoSearch.astro
│   │       └── TourvisorSearch.astro
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── corp.astro      # Коммерческое предложение (/corp)
│   │   └── cabinet.astro   # Личный кабинет туриста (/cabinet)
│   └── styles/global.css
├── public/favicon.svg           # Логотип с пунктирным кругом + самолётик
├── .doc/anro-trip-guide-optimized.md
└── package.json
```

### Sticky Hero + Content Overlay

**Ключевая особенность:** Hero sticky z-0, контент наползает сверху

```astro
<Hero />
<div id="content" class="relative z-10 mt-[20vh] bg-white">
	<div id="search" class="absolute -top-32 w-full h-1"></div>
	<div class="relative z-20 -translate-y-24 px-4 sm:px-6 max-w-7xl mx-auto">
		<SearchWidget />
	</div>
	...остальные секции...
</div>
```

### Z-Index иерархия (НЕ МЕНЯТЬ!)

```
z-[2147483647]  Модальные окна
z-[2147483646]  ScrollToTop
z-[2147483630]  OfficeWidget, FavoritesWidget
z-9999          ScrollProgress
z-50            Header
z-20            SearchWidget
z-10            Content
z-0             Hero
```

---

## 🎨 DESIGN SYSTEM

### Цвета бренда (ОБНОВЛЕНО в феврале 2026)

```css
@theme {
	--color-primary: #00abb3; /* ⭐ Бренд-тил (цвет «trip» в логотипе) */
	--color-primary-light: #33bfc6;
	--color-primary-dark: #008a91;
	--color-secondary: #006d73; /* Глубокий тил */
	--color-secondary-hover: #00585d;
	--color-cta: #ffd417; /* Янтарный (CTA, контраст к тилу) */
	--color-cta-hover: #e5be14;
	--font-montserrat: 'Montserrat', sans-serif;
	--font-inter: 'Inter', sans-serif;
}
```

⚠️ **Старые цвета (`#3fa0f0`, `#1a6db1`) — заменены. Не использовать!**

### Логотип (favicon + компоненты)

Логотип — SVG inline: пунктирный круг (медленно вращается на десктопе) + самолётик `#00abb3` + текст "ANRO" чёрным + "trip" бирюзовым курсивом.

- **Hero:** бренд «ANRO TRIP» в тексте h1 (класс `hero-gradient-text`), отдельного SVG-логотипа нет
- **Header:** компактный логотип, `header-logo-spin` (30s, только `@media hover`)
- **Footer:** такой же как в хедере
- **Вкладка браузера:** `public/favicon.svg` — рукописный SVG с тем же стилем

### Glassmorphism

- **`.glass-panel`** и **`.glass-panel-interactive`** — backdrop-filter на десктопе.
- **`.glass-panel-mobile-solid`** — для TrustBadges и Partners stats: на мобиле `backdrop-filter` отключён, фон непрозрачный (экономия GPU, стабильность).

### Скругления 2026

- `rounded-full` — кнопки, аватары, пилюли
- `rounded-3xl` — карточки, виджеты
- `rounded-2xl` — фото команды, карточки
- Content блок — **без скруглений** (прямые углы, белый стыкуется с Hero без `rounded-t`)

### Типографика

Fluid Typography через `clamp()` — без media queries. Стили в `global.css` на `h1`–`h6`.
Монтсеррат — заголовки, кнопки. Inter — текст.

Шрифты загружаются через `media="print" onload="this.media='all'"` (не блокируют рендер).

### Anti-Generic Guardrails (качество визуала)

Правила, чтобы интерфейс не выглядел как типичный «ИИ-шаблон» (см. `.doc/audit-ai-design-habr.md`, [Habr](https://habr.com/ru/articles/1004960/)).

| Правило              | Как делать                                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Цвета**            | Только из `@theme` (primary, secondary, cta). Не использовать дефолтные Tailwind: `indigo-*`, `blue-600`, `sky-*`, `emerald-*` как основные. Hero по времени суток, Footer соцсети, кнопки — только токены или свои hex в @theme. |
| **Тени**             | Не плоский `shadow-md`. Использовать двухслойные тени с оттенком: `shadow-[0_4px_24px_rgba(0,171,179,0.35)]`, `hover:shadow-xl hover:shadow-primary/20`.                                                                          |
| **Анимации**         | Не `transition-all`. Только явные свойства: `transition-[transform,box-shadow]`, `transition-[transform,opacity]`. Easing — предпочтительно `ease-out`/`ease-in` или cubic-bezier.                                                |
| **Типографика тела** | Для основного текста (body/параграфы) — `line-height: 1.7` (в base или утилита). Заголовки — уже Montserrat + tracking-tight.                                                                                                     |
| **Глубина**          | Слои: base (фон) → elevated (карточки, панели) → floating (модалки, виджеты). Не держать все элементы на одной z-плоскости.                                                                                                       |
| **Интерактив**       | У каждого кликабельного: hover, focus-visible, active (уже в конституции).                                                                                                                                                        |

При рефакторинге и добавлении новых компонентов проверять список в `.doc/audit-ai-design-habr.md`.

---

## ⚡ РЕАЛИЗОВАННЫЕ ФИЧИ (актуальный список)

✅ View Transitions API (`ClientRouter`)
✅ Scroll Progress Bar (градиент primary→secondary→cta)
✅ Fluid Typography (clamp)
✅ Staggered Animations (появление с задержкой)
✅ Trust Badges + Stats (РТО, Топ-10, 14 000+, 18 лет)
✅ Micro-interactions (ripple, magnetic, shake)
✅ Container Queries (`@container`, `@md:`)
✅ Responsive Images (Astro `<Image />`, webp, lazy)
✅ Parallax Scroll — **только десктоп** `matchMedia('hover: hover')`
✅ Dynamic Gradients Hero (4 времени суток)
✅ Ken Burns — **только десктоп**
✅ Hero CTA (shine effect, glow)
✅ Бренд-логотип в Hero, Header, Footer, favicon
✅ Marquee лента партнёров — **только десктоп**, на мобайле grid
✅ Lightbox для отзывов (zoom, swipe, ←→ клавиши, счётчик)
✅ Team раскрывается — 3 hero-карточки + кнопка «Вся команда»
✅ Реальные фото: команда (23 чел.), награды, сертификат
✅ Бento-сетка туров с цветными бейджами
✅ prefers-reduced-motion (полное отключение анимаций)
✅ `meta theme-color`, Open Graph
✅ `fetchpriority="high"` на hero-изображении
✅ Страница `/corp` — Коммерческое предложение (Hero-блок, фото corp.webp)
✅ Страница `/cabinet` — Личный кабинет туриста (форма входа, welcome.webp)
✅ About CTA «Коммерческое Предложение» → `/corp`
✅ Skip Link — «Перейти к содержимому» в Layout.astro
✅ Модалки: Escape, focus trap, возврат фокуса (CallbackModal, GiftModal, ReviewModal, lightbox Reviews)
✅ scroll-margin-top для якорей (#content, #corp-avia и др.)
✅ Corp: break-words, min-w-0 в списках; контент -translate-y-[20vh] при скролле
❌ Dark Mode (отменён)

---

## 📱 МОБИЛЬНАЯ ОПТИМИЗАЦИЯ (критично!)

Главное правило: **тяжёлые эффекты только на `@media (hover: hover)`** (= десктоп с мышью).

| Эффект                                    | Мобайл           | Десктоп            |
| ----------------------------------------- | ---------------- | ------------------ |
| Орбы (blur)                               | `blur-0`         | `md:blur-3xl`      |
| glass-panel (TrustBadges, Partners stats) | solid (без blur) | ✅ backdrop-filter |
| Ken Burns                                 | ❌ статично      | ✅ 30s анимация    |
| Parallax Hero                             | ❌ нет           | ✅ 0.15 коэф.      |
| Marquee партнёры                          | ❌ grid-cols-2   | ✅ marquee         |
| Tour card breathe                         | ❌ нет           | ✅ 24s анимация    |
| Logo spin                                 | ❌ нет           | ✅ 20-30s          |
| hero-gradient-text                        | ❌ просто белый  | ✅ shine анимация  |

```css
/* Паттерн для всех тяжёлых эффектов */
.my-animation {
	animation: none;
}
@media (hover: hover) {
	.my-animation {
		animation: my-anim 20s linear infinite;
	}
}
```

- **Карточки:** `transition-[transform,box-shadow]` вместо `transition-all` — меньше нагрузки и соответствие Anti-Generic Guardrails (см. раздел DESIGN SYSTEM выше).
- **Карусели (Reviews, Partners):** `-webkit-overflow-scrolling: touch` для плавного скролла на iOS.
- **will-change** — только на `#lightbox-track`. На карточках НЕ использовать!

---

## 🔧 КЛЮЧЕВЫЕ КОМПОНЕНТЫ

### Layout.astro

- **Пропсы (по умолчанию true):** `showScrollProgress`, `showScrollToTop`, `showFavorites`, `showOfficeWidget` — управляют отображением виджетов.
- На странице cabinet все четыре отключены.

### Hero.astro

- `loading="eager"` + `fetchpriority="high"` + `quality={75}` на фоне
- Бейдж + h1 (бренд «ANRO TRIP» в hero-gradient-text) + подзаголовок + 2 CTA кнопки + scroll-индикатор
- Parallax: `scrollY * -0.15`, только десктоп

### Header.astro

- **Сетка:** главная — `grid-cols-[1fr_auto_1fr]`, corp — `grid-cols-[auto_minmax(0,1fr)_auto]`; бургер на mobile — `col-start-3` (всегда справа).
- Floating pill, scroll shrink (py-3 → py-2 при scrollY > 60)
- Логотип: пунктирный круг + самолётик + ANRO**trip**
- **Пропсы (опционально):** `navItems`, `ctaText`, `ctaHref` — для corp-страницы свой нав и CTA
- **Логотип:** клик → всегда на главную `/`; с corp — fade-out → переход; на главной — fade-out → scroll to top → fade-in
- Телефон на xl, кнопка CTA, бургер → X анимация
- Мобильное меню: opacity + translateY transition

### SearchWidget.astro

- Табы с bg-highlight (не underline)
- `sw-fade-in` при переключении
- Нет `<style>` блоков

### PopularTours.astro

- Bento grid, Container Queries `@md:col-span-2`
- Цветные бейджи для каждого направления
- Клик → scroll to SearchWidget (не alert)
- `aria-hidden="true"` на дублированных marquee-строках

### Partners.astro

- Desktop: двойная marquee-лента (forward 36s, reverse 30s)
- Mobile: `grid grid-cols-2` статично
- Hover-пауза marquee

### Reviews.astro

- Тёмный фон `gray-950` + сеточная текстура
- Lightbox: swipe touch, ←→ клавиши, zoom ×2.5, счётчик
- Форма: поля rounded-xl, focus:ring-primary

### Awards.astro

- Реальные фото из `assets/awards/`
- `items-start` — все карточки на одном уровне (НЕ mt-8!)
- Бейджи с результатами поверх фото

### Team.astro

- **Основатели:** 3 hero-карточки (Анна / Никита / групповое фото team.webp), `sm:grid-cols-3`
- **Вся команда:** `lg:grid-cols-3`, фото `w-48 h-48`, `object-center`
- Кнопка «Вся команда» — плавное раскрытие через `scrollHeight`

### Contacts.astro

- 3 карточки разных стилей:
  1. Тёмная `gray-900` — телефоны 24/7
  2. Gradient синяя `from-primary to-secondary` — офис
  3. Светлая `gray-50` — представительства

### Footer.astro

- Фон `gray-950`, 3 колонки
- Логотип идентичен хедерному
- Иконки соцсети с цветным hover (VK, WhatsApp, Telegram)

### corp.astro (страница /corp)

**Структура (8 блоков):**

1. **Hero** — `sticky top-0 z-0`, фон corp.webp; при скролле фото фиксировано, контент наползает
2. **#content** — вводный текст (бейдж, заголовок, теги, карточка)
3. **#corp-avia** — Авиа и ж/д билеты (corp1.webp, слева фото)
4. **#corp-hotels** — Подбор отеля (corp.webp, справа фото)
5. **#corp-tours** — Туры (corp2.webp, слева фото)
6. **#corp-transfer** — Трансфер (corp3.webp, справа фото)
7. **#corp-benefits** — Преимущества (corp4.webp, 3 карточки: 18 лет, 24/7, ЭДО)
8. **#corp-contacts** — Контакты (телефон, почта, офисы) перед Footer

**Header на corp:** `navItems` (О компании, Авиабилеты, Отели, Туры, Трансфер, Преимущества, Контакты), `ctaText="Связаться"`, `ctaHref="#corp-contacts"`

**Обёртка контента:** `div` с `z-10 mt-0 -translate-y-[20vh]` — контент появляется сразу при первом скролле. Тексты — оригинал anrotrip.ru. `break-words`, `min-w-0` в абзацах и списках. Якоря `#content`, `#corp-avia`, `#corp-hotels` и др. имеют `scroll-margin-top` в global.css.

### cabinet.astro (страница /cabinet)

- Страница входа в Личный кабинет туриста
- Без Header; Layout с `showScrollProgress`/`showScrollToTop`/`showFavorites`/`showOfficeWidget` = false
- Форма: radio Телефон/Email, поле ввода, кнопка «Войти»
- `action="https://lk.anrotrip.ru/index/welcome"`
- Фон `welcome.webp` из `assets/welcome/`
- Подпись: «© 2009–2026 ООО «МоиДокументы.ру»», ссылка moidokumenti.ru

**Из анализа (см. site-analysis-full.md):** рекомендуется добавить Header или ссылку «На главную», placeholder и `type` (tel/email) для поля ввода, `noindex` для страницы входа, fieldset/legend для radio-группы, focus-visible на кнопке.

### GiftSection.astro

- Фон `gray-950` с сеткой и орбами
- Реальное фото `certif.webp`
- Shine sweep при hover на карте

---

## 🔌 ИНТЕГРАЦИИ

### Tourvisor (НЕ ТРОГАТЬ!)

```css
.TVCartStickyButton {
	opacity: 0 !important;
	left: -9999px !important;
}
iframe[src*='tourvisor'] {
	width: 100% !important;
	min-height: 500px !important;
}
```

- `window.dispatchEvent(new Event('resize'))` при переключении таба.

### Nemo Travel

Работает из коробки, без кастомизации.

---

## 🚨 РЕШЁННЫЕ ПРОБЛЕМЫ

1. **Параллакс + анимации** — параллакс к контенту, kenburns к фону
2. **Мобайл тормозит** — тяжёлые анимации за `@media (hover: hover)`; орбы `blur-0 md:blur-3xl`; glass-panel-mobile-solid для TrustBadges/Partners; transition-all → конкретные свойства на карточках
3. **will-change на карточках** — убраны, остался только на lightbox-track
4. **scroll-snap на html** — убран (вызывал дёрганье)
5. **Tourvisor серая кнопка** — скрыта визуально
6. **Tourvisor мобайл** — `min-height:500px` + resize event
7. **Голова на фото обрезана** — `object-center` (не `object-top`)
8. **Средняя карточка наград смещена** — убран `md:mt-8`, добавлен `items-start`
9. **Шрифты блокируют рендер** — `media="print" onload`
10. **Content блок: округлости по бокам** — убран `rounded-t-[40px]`, стык Hero/контент прямой
11. **Skip Link** — добавлен в Layout.astro
12. **Модалки** — Escape, focus trap, возврат фокуса (CallbackModal, GiftModal, ReviewModal, lightbox Reviews)
13. **Corp: мобильный текст** — break-words, min-w-0 в списках; scroll-margin-top для якорей; контент -translate-y-[20vh] при скролле
14. **Header** — бургер col-start-3 на mobile; сетка для corp vs main

---

## 📊 SEO / GEO / AEO

- E-E-A-T: 18 лет, 14 000+ клиентов, РТО 022708, Топ-10 России
- `meta theme-color: #00abb3`, Open Graph теги добавлены
- **Критично (перед продакшеном):** og:image, placeholder Reviews → реальные фото, GiftModal `<Image />`
- **Важно:** Schema.org (LocalBusiness/TravelAgency), canonical URL, og:url, robots.txt
- **Желательно:** FAQ секция, страницы направлений, Breadcrumbs
- **Качество визуала (анти-ИИ-шаблон):** см. `.doc/audit-ai-design-habr.md` и раздел «Anti-Generic Guardrails» в DESIGN SYSTEM — замена transition-all, цвета только @theme, тени с оттенком, body line-height

---

## 🛠️ РАЗРАБОТКА

```bash
npm run dev    # localhost:4321
npm run build  # dist/
npm run lint
npx prettier --write "src/**/*.astro"
```

### Git Workflow

- ❌ НЕ обновлять git config
- ❌ НЕ push --force, hard reset
- ❌ НЕ коммитить без запроса пользователя
- ✅ Коммиты только по явному запросу

---

## 📝 СЛЕДУЮЩИЕ ШАГИ

> **Полный план и приоритеты** — `.doc/site-analysis-full.md` (Часть 5, Часть 6).

### Критично (перед продакшеном)

- [ ] og:image (главная, corp)
- [ ] Reviews: заменить placeholder на реальные фото
- [ ] GiftModal: перевести `<img>` на `<Image />`

### Важно

- [ ] Schema.org (LocalBusiness/TravelAgency)
- [ ] canonical URL, og:url, robots.txt
- [ ] focus-visible:ring-2 — унифицировать у всех интерактивных элементов
- [ ] Контраст тёмных секций (Reviews, Team, GiftSection) — WCAG AA
- [ ] Lighthouse: CSS/JS, ошибки консоли, deprecated API
- [ ] Cabinet: Header или «На главную»; placeholder и type для input; noindex

### Желательно

- [ ] FAQ секция (главная или corp)
- [ ] SearchWidget табы: role="tablist", стрелки
- [ ] Бургер-меню: закрытие по Escape

---

## 📌 ДЛЯ СЛЕДУЮЩЕГО AI

### Читай ПЕРВЫМ:

1. `.specify/memory/constitution.md` — Конституция
2. Этот файл
3. `.doc/site-analysis-full.md` — полный анализ сайта (приоритеты, Lighthouse, тесты)

### Перед редактированием:

1. Прочитать файл через Read tool
2. Не перезаписывать ручные правки
3. Не трогать Tourvisor/Nemo без причины
4. Не менять z-index иерархию

### Железные правила:

- ❌ НЕ создавать `.css` файлы
- ❌ НЕ использовать `<style>` блоки в компонентах
- ❌ НЕ использовать старые цвета `#3fa0f0`, `#1a6db1`
- ✅ ТОЛЬКО Tailwind утилиты + JIT + global.css
- ✅ Tailwind v4: `bg-linear-to-r`, `z-9999`
- ✅ Тяжёлые анимации — только `@media (hover: hover)`
- ✅ Цвет бренда: `primary: #00abb3`

---

**Версия:** 3.3
**Дата:** 22 февраля 2026
**Автор:** AI Senior Fullstack Developer + hyper
**Статус:** Актуально

**Изменения от v3.3 (22.02.2026) — по site-analysis-full.md:**

- **Glassmorphism:** glass-panel-mobile-solid для TrustBadges и Partners (blur отключён на мобайле)
- **Мобильная оптимизация:** орбы blur-0 md:blur-3xl; transition конкретные свойства; -webkit-overflow-scrolling: touch
- **Header:** сетка corp vs main; бургер col-start-3
- **Corp:** -translate-y-[20vh], break-words, scroll-margin-top
- **Реализовано:** Skip Link, модалки (Escape, focus trap), scroll-margin-top
- **Следующие шаги** и **SEO** — выровнены с приоритетами анализа
- Добавлена ссылка на `.doc/site-analysis-full.md`

**Изменения от v3.2 (22.02.2026):**

- Страница `/cabinet` — Личный кабинет туриста (форма входа, welcome.webp, без Header)
- **Layout.astro** — пропсы `showScrollProgress`, `showScrollToTop`, `showFavorites`, `showOfficeWidget` (по умолчанию true)
- **Hero** — уточнение: бренд «ANRO TRIP» в h1 (hero-gradient-text), без отдельного SVG-логотипа

**Изменения от v3.1 (22.02.2026):**

- **corp.astro** — 8 блоков: Hero (sticky), вводный текст, Авиабилеты (corp1), Отели (corp), Туры (corp2), Трансфер (corp3), Преимущества (corp4, 3 карточки), Контакты. Sticky Hero — фото corp.webp фиксировано, контент наползает при скролле.
- **Header.astro** — пропсы `navItems`, `ctaText`, `ctaHref` для corp-навигации; логотип всегда ведёт на `/` с эффектом fade-out.
- **Логотип** — клик: с corp → fade → переход на главную; на главной → fade → scroll to top → fade-in.

**Изменения от v3.0 (21.02.2026):**

- Страница `/corp` — Коммерческое предложение (Hero-блок, corp.webp)
- About CTA «Коммерческое Предложение» → `/corp`
- Content блок: убран `rounded-t-[40px]` — прямой стык Hero/контент

**Изменения от v2.0:**

- Полный редизайн всех компонентов в стиле 2026
- Новая цветовая схема бренда (#00abb3)
- Логотип в Hero, Header, Footer, favicon
- Реальные фото команды, наград, сертификата
- Мобильная оптимизация: убраны тяжёлые GPU-эффекты
- Partners: marquee desktop / grid mobile
- Team: 3 hero-карточки + раскрываемая сетка lg:grid-cols-3
- prefers-reduced-motion, Open Graph, fetchpriority
