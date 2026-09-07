# Blur в production: cssMinify: false

> Этот файл описывает известную проблему стека и её решение.  
> Ссылка из `astro.config.mjs`.

---

## Проблема

При `vite.build.cssMinify: true` (значение по умолчанию) Tailwind v4 + Vite минифицирует CSS таким образом, что `backdrop-blur-*` классы перестают применяться в production-сборке:

- `backdrop-blur-sm`, `backdrop-blur-md`, `backdrop-blur-lg` → **визуально не работают**
- В dev-режиме (`pnpm dev`) всё работает нормально — проблема только в production

Затронутые компоненты:

- `Header.astro` — стеклянный эффект шапки
- `ui/Modal.astro` — backdrop blur модальных окон
- `CallbackModal.astro`, `GiftModal.astro`, `ReviewModal.astro`
- Любой компонент с `backdrop-blur-*`

---

## Решение

В `astro.config.mjs` установлено:

```js
vite: {
  build: {
    cssMinify: false,  // НЕ МЕНЯТЬ!
  },
},
```

Это отключает минификацию CSS, что немного увеличивает размер CSS-файла, но сохраняет работоспособность blur-эффектов.

---

## Статус

- **Версия стека:** Astro 6.x + Tailwind CSS 4.2.x + @tailwindcss/vite 4.2.x
- **Проблема воспроизводится:** при установке `cssMinify: true` или удалении ключа
- **Обходное решение:** `cssMinify: false` — стабильно, без побочных эффектов
- **Следить за:** обновлениями @tailwindcss/vite — возможно, в будущих версиях исправят

---

## Влияние на производительность

CSS без минификации немного больше по размеру (~5–15% для нашего стека), но:

- Caddy сжимает ответы через `encode gzip` → разница в сети минимальна
- Blur-эффекты критичны для UX (Header, Modal)

---

## Связанные документы

- `astro.config.mjs` — строка с комментарием `cssMinify: false`
- [server-vps-stack-plan.md](./server-vps-stack-plan.md) — Caddy encode gzip
