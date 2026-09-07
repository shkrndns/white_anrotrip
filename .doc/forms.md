# Формы сайта ANRO TRIP

> Полная документация: поля, эндпоинты, валидация, защита, email/Telegram, 152-ФЗ.

---

## Обзор форм

| Форма                 | Эндпоинт             | Компонент             | Описание                                                 |
| --------------------- | -------------------- | --------------------- | -------------------------------------------------------- |
| Обратный звонок       | `POST /api/callback` | `CallbackModal.astro` | Имя + телефон                                            |
| Подарочный сертификат | `POST /api/gift`     | `GiftModal.astro`     | ФИО + телефон + email                                    |
| Отзыв                 | `POST /api/review`   | `ReviewModal.astro`   | Имя + телефон + email + город + услуга + рейтинг + текст |

---

## Форма 1: Обратный звонок

### Поля

| Поле    | Тип    | Обязательно | Валидация                     |
| ------- | ------ | ----------- | ----------------------------- |
| `name`  | string | ✅          | минимум 2 символа             |
| `phone` | string | ✅          | минимум 7 символов            |
| `_hp`   | string | ❌          | honeypot (должно быть пустым) |

### Эндпоинт: `POST /api/callback`

Принимает: `application/json` или `multipart/form-data`

**Ответы:**

| Статус | Тело                                                | Причина                                                |
| ------ | --------------------------------------------------- | ------------------------------------------------------ |
| 200    | `{ ok: true }`                                      | Успех                                                  |
| 200    | `{ ok: true }`                                      | Honeypot сработал (silent drop)                        |
| 422    | `{ ok: false, error: "Укажите имя" }`               | Имя пустое/короткое                                    |
| 422    | `{ ok: false, error: "Укажите телефон" }`           | Телефон пустой/короткий                                |
| 403    | `{ ok: false, error: "Запрос отклонён." }`          | Origin/Referer не с нашего домена                      |
| 429    | `{ ok: false, error: "Слишком много запросов..." }` | Rate limit                                             |
| 500    | `{ ok: false, error: "..." }`                       | Ошибка сервера (в production — без внутренних деталей) |

**Email-уведомление:**

- Тема: `📞 Обратный звонок — {name}`
- Поля в письме: Имя клиента, Телефон (выделен)

**Telegram-уведомление:**

- `📞 ЗАКАЗ ОБРАТНОГО ЗВОНКА`
- `👤 Имя: {name}` / `📱 Телефон: {phone}`

---

## Форма 2: Подарочный сертификат

### Поля

| Поле    | Тип    | Обязательно | Валидация          |
| ------- | ------ | ----------- | ------------------ |
| `fio`   | string | ✅          | минимум 2 символа  |
| `phone` | string | ✅          | минимум 7 символов |
| `email` | string | ✅          | содержит `@`       |
| `_hp`   | string | ❌          | honeypot           |

### Эндпоинт: `POST /api/gift`

**Ответы:** аналогично callback (200/422/429/500)

**Email:** Тема `🎁 Подарочный сертификат — {fio}`, поля: ФИО, Телефон, E-mail

**Telegram:** `🎁 ПОДАРОЧНЫЙ СЕРТИФИКАТ`

---

## Форма 3: Отзыв

### Поля

| Поле      | Тип          | Обязательно | Валидация           |
| --------- | ------------ | ----------- | ------------------- |
| `name`    | string       | ✅          | минимум 2 символа   |
| `review`  | string       | ✅          | минимум 10 символов |
| `phone`   | string       | ❌          | —                   |
| `email`   | string       | ❌          | —                   |
| `city`    | string       | ❌          | —                   |
| `service` | string       | ❌          | —                   |
| `rating`  | string (1–5) | ❌          | —                   |
| `_hp`     | string       | ❌          | honeypot            |

### Эндпоинт: `POST /api/review`

**Email:** Тема `⭐ Отзыв — {name}`, все поля включая текст отзыва

**Telegram:** `⭐ ОТЗЫВ` + полный текст отзыва после разделителя

---

## Защита форм

### Honeypot

Все формы содержат скрытое поле `_hp`. Если оно не пустое — запрос молча принимается (`{ ok: true, 200 }`) без отправки уведомлений. Боты заполняют все поля подряд.

```html
<!-- Пример в Astro компоненте -->
<input type="text" name="_hp" class="hidden" tabindex="-1" autocomplete="off" />
```

### Rate Limit (in-memory)

Файл: `src/lib/mailer.ts` → `isRateLimited(ip: string)`

- **Лимит:** 5 запросов с одного IP
- **Окно:** 10 минут (600 000 мс)
- **Сброс:** автоматически по истечении окна
- **Реальный IP:** Caddy передаёт через `X-Forwarded-For` с `trusted_proxies cloudflare`

При превышении: HTTP 429 `{ ok: false, error: "Слишком много запросов. Попробуйте позже." }`

> ⚠️ Rate limit хранится в памяти и сбрасывается при перезапуске контейнера.

### Проверка Origin / Referer

Файл: `src/lib/security.ts` → `isAllowedFormRequest(request)`

- В **production** POST `/api/*` принимается только с `https://anrotrip.ru` или `https://www.anrotrip.ru`
- Проверяется заголовок `Origin`; если его нет — `Referer`
- В **dev** (`NODE_ENV !== production`) ограничение отключено
- При отклонении: HTTP 403 `{ ok: false, error: "Запрос отклонён." }`

### Безопасные ошибки сервера

Файл: `src/lib/security.ts` → `safeApiError(err)`

- В production клиенту не отдаются детали SMTP/env (`SMTP_HOST не задан` и т.п.)
- Общее сообщение: «Не удалось отправить заявку. Попробуйте позже или позвоните нам.»

---

## Отправка уведомлений

### Email (nodemailer + Яндекс SMTP)

Файл: `src/lib/mailer.ts` → `sendEmail(payload: MailPayload)`

```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=online@anrotrip.ru
SMTP_PASS=<пароль>
MAIL_TO=online@anrotrip.ru
MAIL_FROM=online@anrotrip.ru
```

**HTML-шаблон письма** (`wrapHtml`):

- Брендированная шапка с градиентом #00abb3 → #008a91
- Таблица с полями заявки
- Время по Екатеринбургу (Intl.DateTimeFormat)
- Адаптивный дизайн для почтовых клиентов

### Telegram Bot

Файл: `src/lib/mailer.ts` → `sendTelegram(text: string)`

```
TELEGRAM_BOT_TOKEN=<токен>
TELEGRAM_CHAT_ID=<id чата>
```

- Если переменные не заданы — молча пропускает (не бросает ошибку)
- Формат: HTML, с `parse_mode: 'HTML'`
- Telegram некритичен: если не отправился — email уже ушёл

---

## 152-ФЗ: обработка персональных данных

- Данные из форм **не логируются** в `console.*` (по закону о ПД)
- `privacy.astro` — страница политики конфиденциальности (без Яндекс Метрики / GA на текущий момент)
- Формы содержат ссылку на политику и чекбокс-подтверждение (в UI)
- Хранение данных: не хранятся в БД; только уведомление на email менеджера
- Cookie-баннер: `localStorage` `anro_cookies_accepted` — см. [analytics-cookies-plan.md](./analytics-cookies-plan.md)
- Юридический статус страниц: [legal-pages-review.md](./legal-pages-review.md)

---

## UI-состояния форм

| Состояние  | Визуализация                                           |
| ---------- | ------------------------------------------------------ |
| Дефолт     | Кнопка активна                                         |
| Loading    | Кнопка: `"Отправляем..."` + disabled                   |
| Success    | Сообщение об успехе; форма скрывается или сбрасывается |
| Error      | Сообщение об ошибке под кнопкой (красный текст)        |
| Validation | Подсветка полей с ошибкой + сообщение рядом с полем    |

---

## Переменные окружения

Файл-шаблон: `.env.example`

```bash
# Email
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=online@anrotrip.ru
SMTP_PASS=yourpassword
MAIL_TO=online@anrotrip.ru
MAIL_FROM=online@anrotrip.ru

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

На VPS файл `.env` находится в `/home/deploy/anrotrip/.env` и монтируется в контейнер через `env_file`.

---

## Связанные документы

| Документ                                                       | Содержание                     |
| -------------------------------------------------------------- | ------------------------------ |
| [server-vps-stack-plan.md](./server-vps-stack-plan.md)         | Деплой и инфраструктура        |
| [security-baseline-package.md](./security-baseline-package.md) | Расширенная защита форм        |
| [security-audit-2026-07.md](./security-audit-2026-07.md)       | Security-аудит: сделано и TODO |
