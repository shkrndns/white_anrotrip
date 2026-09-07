# План тестирования

> **Обновлено:** 2026-09-07 · Playwright и Lighthouse CI настроены.

---

## Автоматические тесты (CI)

```bash
pnpm build
pnpm test:e2e              # smoke + mobile drawer
pnpm test:e2e --project=chromium
pnpm lhci                  # Lighthouse budgets (PR)
```

Файлы: `e2e/smoke.spec.ts`, `e2e/mobile-menu.spec.ts`, `playwright.config.ts`, `lighthouserc.cjs`.

Покрытие smoke:

- главная (hero, search-widget)
- модалки callback + gift + форма отзыва
- 404
- блог (список)
- mobile drawer

---

## Smoke-тесты страниц

| Страница       | URL                           | Проверить                  |
| -------------- | ----------------------------- | -------------------------- |
| Главная        | `/`                           | Hero, поиск, секции, хедер |
| Личный кабинет | `/cabinet`                    | Форма входа                |
| Условия        | `/terms`                      | Текст                      |
| Политика       | `/privacy`                    | Текст                      |
| 404            | `/несуществующая`             | noindex, текст             |
| Блог           | `/blog`                       | Список                     |
| Статья         | `/blog/egypt-family-vacation` | Контент                    |

> **`/corp`** — не публикуется; черновик в `src/_archive/corp/`.

---

## E2E форм (расширение)

Отправка форм на prod/staging требует SMTP/Telegram. В CI проверяется только UI модалок. Для полного E2E submit — mock API или staging с `.env`.

---

## Чеклист перед деплоем

- [ ] `pnpm check` — без ошибок
- [ ] `pnpm lint` — без ошибок
- [ ] `pnpm build` — успешна
- [ ] `pnpm test:e2e` — passed
- [ ] Smoke страниц в preview
- [ ] `backdrop-blur` на production (не белые блоки)
- [ ] Формы: письмо + Telegram на staging

---

## Связанные документы

| Документ                                               | Содержание      |
| ------------------------------------------------------ | --------------- |
| [refactoring-plan.md](./refactoring-plan.md)           | Когда запускать |
| [deploy-prep-checklist.md](./deploy-prep-checklist.md) | День 2 деплоя   |
