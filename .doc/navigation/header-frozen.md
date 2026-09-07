# Хедер (Header.astro) — ЗАМОРОЖЕН

> ⚠️ **НЕ МЕНЯТЬ без явной просьбы заказчика.**  
> Любые изменения в структуру меню, вёрстку, подменю или drawer — только после явного согласования.

---

## Файл

`src/components/Header.astro`

---

## Props интерфейс

```typescript
export interface Props {
	navItems?: { name: string; href: string }[]; // плоский список для мобильного drawer
	ctaText?: string; // текст кнопки CTA (default: 'Личный кабинет')
	ctaHref?: string; // ссылка CTA (default: /cabinet)
	navVariant?: 'default' | 'corp'; // вариант навигации
	homeQuickContacts?: boolean; // круглые кнопки телефона/Telegram/MAX (только главная)
}
```

---

## Варианты навигации

### `navVariant: 'default'` (главная страница)

- Desktop (`nav:`): плавающая pill-навигация по центру страницы
- Ширина `w-max`, равные зазоры лого—меню—кнопки
- **Подменю** (dropdown):
  - «О компании» → О нас / Наши услуги / Направления
  - «Доверие» → Партнёры / Отзывы / Награды / Сертификат
- Отдельные ссылки до групп: Авиабилеты, Туры, Журнал
- Отдельные ссылки после групп: Вопросы, Команда, Контакты

### `navVariant: 'corp'` (страница /corp и остальные)

- Плоский список `navItems` без подменю
- Упрощённая вёрстка

---

## Навигационные ссылки

### Якоря (главная)

| Ссылка      | href (главная)   | href (другие страницы) |
| ----------- | ---------------- | ---------------------- |
| Авиабилеты  | `#search`        | `/#search`             |
| Туры        | `#popular-tours` | `/#popular-tours`      |
| Журнал      | `#journal`       | `/#journal`            |
| О нас       | `#about`         | `/#about`              |
| Наши услуги | `#services`      | `/#services`           |
| Для бизнеса | `#business`      | `/#business`           |
| Партнёры    | `#partners`      | `/#partners`           |
| Отзывы      | `#reviews`       | `/#reviews`            |
| Награды     | `#awards`        | `/#awards`             |
| Сертификат  | `#gift`          | `/#gift`               |
| Вопросы     | `#faq`           | `/#faq`                |
| Команда     | `#team`          | `/#team`               |
| Контакты    | `#contacts`      | `/#contacts`           |

---

## Быстрые контакты (`homeQuickContacts: true`)

Только на главной странице. Круглые кнопки справа от навигации:

- 📞 Телефон: +7 (922) 026-70-59
- Telegram: @anro_trip → `https://t.me/anro_trip`
- MAX: `https://max.ru/u/f9LHodD0cOKNXrTMtvUZWd2zLeGEpz34bQ0i1a-Ur_6EKrIw9H11bR6uhLM`

---

## Мобильный Drawer

- Открывается через кнопку-гамбургер
- Показывает плоский список `navItems`
- Blur-overlay под drawer

Подробнее: [mobile-menu.md](./mobile-menu.md)

---

## Anchor Scroll

Детальная документация якорей, scroll-mt и отступов:  
[header-anchor-scroll.md](./header-anchor-scroll.md)

---

## Использование

```astro
---
import Header from '../components/Header.astro';
---

<!-- Главная -->
<Header navVariant="default" homeQuickContacts={true} />

<!-- Корпоративная -->
<Header navVariant="corp" homeQuickContacts={false} />
```

---

## Связанные документы

| Документ                                             | Содержание                       |
| ---------------------------------------------------- | -------------------------------- |
| [header-anchor-scroll.md](./header-anchor-scroll.md) | Якоря, scroll-mt, числа отступов |
| [mobile-menu.md](./mobile-menu.md)                   | Мобильный drawer (часть хедера)  |
