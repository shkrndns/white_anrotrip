# Security-аудит приложения (июль 2026)

> **Статус:** Частично выполнено (код) · инфраструктура — по чеклисту VPS  
> **Основание:** чеклист из [basic-security-audit-prompt](https://github.com/hyperdevops/prompts) (10 пунктов)  
> **Дата:** 30 июля 2026

---

## Краткий итог

| Метрика | Значение |
|---|---|
| Критичных уязвимостей (🔴) | **0** (после исправлений) |
| Риски, требующие усиления (🟡) | **4** |
| Пункты в порядке (🟢) | **6** |
| `pnpm check` | ✅ проходит |

Архитектура сайта — **статический контент + SSR-формы без БД**. SQL-инъекция и IDOR к текущему коду не применимы. Основные векторы: спам форм, утечка деталей ошибок, отсутствие security headers, инфраструктура VPS.

---

## 1. Светофор (10 пунктов аудита)

| # | Что проверяли | Статус | Коротко |
|---|---------------|--------|---------|
| 1 | Инъекции (SQL / команды) | 🟢 | БД и SQL нет; `exec` / `eval` / `child_process` не используются |
| 2 | XSS | 🟡 | Пользовательский ввод на страницы не выводится; CSP с `unsafe-inline` (виджеты Nemo/Tourvisor) |
| 3 | CSRF | 🟡 | Cookie-сессий нет; добавлена проверка Origin/Referer; CSRF-токены не внедрялись |
| 4 | IDOR / права доступа | 🟢 | Нет эндпоинтов с ресурсами по `id` |
| 5 | Аутентификация | 🟢 | Локального логина нет; `/cabinet` → внешний `lk.anrotrip.ru` |
| 6 | Секреты | 🟢 | `.env` в `.gitignore`; в коде только плейсхолдеры в `.env.example` |
| 7 | Хранилище файлов | 🟢 | Загрузок пользователей нет; S3 не используется |
| 8 | Rate limit + валидация | 🟢 | Zod + honeypot + rate-limit (5 req / 10 мин / IP) |
| 9 | Риски ИИ-агента | 🟢 | ИИ-функций в приложении нет; зависимости стандартные |
| 10 | Базовые слои защиты | 🟡 | Security headers добавлены; dev-зависимости в `pnpm audit` — остаточный риск |

---

## 2. Что сделано (код)

### 2.1 Security headers — `src/middleware.ts`

Добавлен Astro middleware, который на **каждый ответ** выставляет:

| Заголовок | Значение |
|---|---|
| `Content-Security-Policy` | Ограниченный CSP с доменами Nemo/Tourvisor (см. ниже) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` (только `NODE_ENV=production`) |

**CSP (текущий):**

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://tourvisor.ru https://cdn.nemo.travel;
style-src 'self' 'unsafe-inline' https://cdn.nemo.travel;
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://tourvisor.ru https://cdn.nemo.travel https://ticket.anrotrip.ru;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://lk.anrotrip.ru
```

> ⚠️ `script-src 'unsafe-inline'` необходим из-за inline-скриптов Astro, Nemo и Tourvisor. Полноценная XSS-защита через CSP ограничена — это осознанный компромисс.

### 2.2 Security headers на периметре — `Caddyfile`

Дублирование базовых заголовков на уровне Caddy (до Node):

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `-Server` (скрыть версию Caddy)

### 2.3 Защита API-форм — `src/lib/security.ts`

| Функция | Назначение |
|---|---|
| `isAllowedFormRequest()` | В production разрешает POST `/api/*` только с `https://anrotrip.ru` и `https://www.anrotrip.ru` (по `Origin` или `Referer`) |
| `safeApiError()` | В production не отдаёт `err.message` клиенту (SMTP/env детали скрыты) |

Подключено в: `src/pages/api/callback.ts`, `gift.ts`, `review.ts`.

**Новый ответ API:**

| Статус | Тело | Причина |
|---|---|---|
| 403 | `{ ok: false, error: "Запрос отклонён." }` | Origin/Referer не с нашего домена |

### 2.4 Экранирование Telegram HTML — `src/lib/mailer.ts`

Пользовательские поля форм экранируются через `escTelegram()` перед вставкой в `parse_mode: HTML`. Ранее возможна была подмена разметки в уведомлениях боту.

Email-шаблон (`wrapHtml`) уже использовал `escHtml()` — без изменений.

### 2.5 Обновление nodemailer

| Было | Стало | Причина |
|---|---|---|
| `nodemailer@8.0.11` | `nodemailer@9.0.3` | [GHSA-p6gq-j5cr-w38f](https://github.com/advisories/GHSA-p6gq-j5cr-w38f) (high) |

---

## 3. Что уже было в порядке (не менялось)

- **Honeypot** (`_hp`) во всех формах — silent drop ботов
- **Rate-limit** in-memory: 5 запросов / 10 мин / IP (`src/lib/mailer.ts`)
- **Валидация Zod** — `src/lib/schemas.ts`
- **152-ФЗ:** данные форм не логируются в `console.*`
- **Docker:** non-root пользователь `astro` (UID 1001)
- **Секреты:** только в `.env` на VPS, шаблон — `.env.example`
- **Нет БД** → SQL-инъекция не применима
- **Нет локальной авторизации** → риски паролей/сессий не применимы

---

## 4. Что нужно сделать

### 4.1 После деплоя — smoke-test (обязательно)

- [ ] Отправить все 3 формы с production (`callback`, `gift`, `review`) — убедиться, что 200 OK
- [ ] Проверить виджеты **Nemo** и **Tourvisor** — CSP не блокирует скрипты/стили
- [ ] Проверить форму входа `/cabinet` → `lk.anrotrip.ru` (директива `form-action`)
- [ ] Проверить заголовки: [securityheaders.com](https://securityheaders.com) или `curl -I https://anrotrip.ru`
- [ ] Убедиться, что Telegram-уведомления приходят с корректной разметкой

Если CSP блокирует виджет — добавить домен в `src/middleware.ts` → `CONTENT_SECURITY_POLICY` и пересобрать.

### 4.2 Инфраструктура VPS (не в коде)

См. [perimeter-edge-security.md](../deploy/perimeter-edge-security.md) и [security-hardening-checklist.md](./security-hardening-checklist.md):

- [ ] **UFW:** закрыть все порты кроме SSH / 80 / 443
- [ ] **SSH:** только ключи, нестандартный порт, `PermitRootLogin no`
- [ ] **fail2ban:** защита SSH (и при необходимости HTTP 4xx)
- [ ] **Cloudflare / DDoS-Guard:** проксирование, Bot Fight Mode
- [ ] **HSTS preload:** подать домен на [hstspreload.org](https://hstspreload.org) после стабильного HTTPS

### 4.3 Усиление форм (по мере роста трафика)

- [ ] **Rate-limit на уровне Caddy** — не сбрасывается при рестарте контейнера
- [ ] **Redis / shared store** для rate-limit при нескольких инстансах
- [ ] **CSRF-токены** — имеет смысл при появлении cookie-авторизации на сайте
- [ ] **CAPTCHA** (hCaptcha / Yandex SmartCaptcha) — при массовом спаме форм

### 4.4 CSP — постепенное ужесточение

- [ ] Запустить CSP в режиме `Content-Security-Policy-Report-Only` и собрать отчёты о нарушениях
- [ ] Вынести inline-скрипты в отдельные файлы (где возможно) → убрать `'unsafe-inline'` из `script-src`
- [ ] Добавить `report-uri` / `report-to` для мониторинга

### 4.5 Зависимости (`pnpm audit`)

Остаточные high-уязвимости в **dev/build**-цепочке (не в production runtime):

| Пакет | Риск | Действие |
|---|---|---|
| `vite` ≤7.3.4 | Обход `fs.deny` на Windows | Обновится с Astro; на Linux VPS не критично |
| `svgo` <4.0.2 | `removeScripts` не удаляет все скрипты | Только build-time; обновится транзитивно |
| `fast-uri` | Host confusion | Только `@astrojs/check` (dev) |

- [ ] Периодически запускать `pnpm audit` перед релизами
- [ ] Обновлять Astro / зависимости по мере выхода патчей

### 4.6 Внешние сервисы (вне репозитория)

- [ ] Аудит **`lk.anrotrip.ru`** — там есть авторизация и, вероятно, БД
- [ ] Ротация секретов при компрометации (SMTP, Telegram Bot, SSH-ключи)

---

## 5. Карта файлов

| Файл | Роль |
|---|---|
| `src/middleware.ts` | Security headers (CSP, HSTS, X-Frame-Options, …) |
| `src/lib/security.ts` | Origin/Referer check, безопасные ошибки API |
| `src/lib/mailer.ts` | Rate-limit, email/Telegram, `escHtml` / `escTelegram` |
| `src/lib/schemas.ts` | Zod-схемы валидации форм |
| `src/pages/api/callback.ts` | POST обратный звонок |
| `src/pages/api/gift.ts` | POST подарочный сертификат |
| `src/pages/api/review.ts` | POST отзыв |
| `Caddyfile` | HTTPS, trusted_proxies cloudflare, заголовки периметра |
| `.env.example` | Шаблон секретов (без реальных значений) |

---

## 6. Рекомендуемая точка старта

1. **Задеплоить** изменения и пройти smoke-test (§4.1).
2. **Настроить VPS** по [perimeter-edge-security.md](../deploy/perimeter-edge-security.md) (§4.2).
3. При спаме форм — rate-limit на Caddy (§4.3).

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [forms.md](../forms/forms.md) | Формы: поля, эндпоинты, honeypot, rate-limit |
| [security-baseline-package.md](./security-baseline-package.md) | Этапный baseline безопасности |
| [security-hardening-checklist.md](./security-hardening-checklist.md) | Полный чеклист VPS с конфигами |
| [perimeter-edge-security.md](../deploy/perimeter-edge-security.md) | UFW, SSH, Cloudflare, DNS |
| [server-vps-stack-plan.md](../deploy/server-vps-stack-plan.md) | Docker, Caddy, CI/CD |
