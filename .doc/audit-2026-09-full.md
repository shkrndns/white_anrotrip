# Полный аудит проекта ANRO TRIP — сентябрь 2026

> Дата: 2026-09-05
> Стек на момент аудита: Astro 7.2.9 · @astrojs/node 11.1.4 · Tailwind CSS 4.3.2 · TypeScript 5.9.3 · zod 4.4.3 · nodemailer 9.0.1 · Node 22.23.2 · pnpm 11.3.0
> `pnpm check` — **0 ошибок, 0 предупреждений** (1 hint в `scripts/typograf-blog.mjs:15`)
> Проверено: безопасность, инфраструктура, производительность, a11y, SEO, архитектура, дизайн-система, документация

---

## Оглавление

1. [Executive summary](#1-executive-summary)
2. [Блокеры (P0)](#2-блокеры-p0)
3. [Безопасность](#3-безопасность)
4. [Инфраструктура, Docker, CI/CD](#4-инфраструктура-docker-cicd)
5. [Производительность](#5-производительность)
6. [Доступность (a11y)](#6-доступность-a11y)
7. [SEO и веб-стандарты](#7-seo-и-веб-стандарты)
8. [Архитектура и качество кода](#8-архитектура-и-качество-кода)
9. [Дизайн-система](#9-дизайн-система)
10. [Актуальность документации](#10-актуальность-документации)
11. [Что сделано хорошо](#11-что-сделано-хорошо)
12. [План действий по порядку](#12-план-действий-по-порядку)

---

## 1. Executive summary

Проект в хорошем состоянии для своего этапа: строгий TypeScript без `any` и `@ts-ignore`, серверная валидация через zod, honeypot + rate-limit, security-заголовки в двух слоях (middleware + Caddy), Astro `<Image>` повсеместно, локальные шрифты вместо Google CDN, skip-link, `prefers-reduced-motion`, FAQPage/BlogPosting JSON-LD, Dependabot, multi-stage Docker с non-root пользователем.

Однако найдены **семь блокеров**, которые ломают заявленную функциональность в production. Три из них связаны с тем, что при переходе на Astro 7 не была задана новая обязательная опция `security.allowedDomains`, а два — с рассинхроном между тем, что написано в комментариях, и тем, что реально исполняется (`prebuild` в Docker, `trusted_proxies cloudflare` в Caddy).

Метрики масштаба проблем:

| Метрика                       | Значение                             | Целевое     |
| ----------------------------- | ------------------------------------ | ----------- |
| CSS в бандле                  | **363 KB** raw / 55 KB gzip          | < 60 KB raw |
| WOFF2 в `dist/`               | **828 KB** (78 файлов)               | ~150 KB     |
| `node_modules` в prod-образе  | **401 MB**                           | ~5 MB       |
| Inline untyped JS на страницу | **~68 KB** (~800 строк)              | < 20 KB     |
| Файлов > 300 строк            | **15** (макс. 1233)                  | —           |
| Дублей form-submit            | **4**                                | 1           |
| Арбитражных `text-[Npx]`      | **67** (14 размеров)                 | токены      |
| Мёртвого CSS                  | ~150–200 строк                       | 0           |
| Эффективный rate-limit        | **5 запросов / 10 мин на весь сайт** | 5 / IP      |

---

## 2. Блокеры (P0)

### P0-1. Rate-limit не работает как задумано — форма ложится от 5 запросов на весь сайт

**Файлы:** `astro.config.mjs` (отсутствует `security.allowedDomains`), `src/pages/api/callback.ts:18`, `gift.ts:18`, `review.ts:19`, `src/lib/mailer.ts:99`

Astro 7 доверяет `X-Forwarded-For` только если Host прошёл валидацию по whitelist:

```js
// node_modules/astro/dist/core/app/node.js:46-48
const hostValidated =
	validated.host !== undefined || validatedHostname !== undefined;
const forwardedClientIp = hostValidated
	? getFirstForwardedValue(req.headers['x-forwarded-for'])
	: undefined;
const clientIp = forwardedClientIp || req.socket?.remoteAddress;
```

А `validateHost()` возвращает `undefined`, если whitelist пуст:

```js
// node_modules/astro/dist/core/app/validate-headers.js
function validateHost(host, protocol, allowedDomains) {
  if (!host || host.length === 0) return undefined;
  if (!allowedDomains || allowedDomains.length === 0) return undefined;   // ← наш случай
  ...
}
```

`security.allowedDomains` в `astro.config.mjs` **не задан**. Следствия в production (Cloudflare → Caddy → app:4321):

1. `clientAddress` для **всех** посетителей равен внутреннему IP контейнера Caddy (например `172.18.0.2`).
2. `isRateLimited()` считает всех как одного клиента → **лимит 5 заявок за 10 минут на весь сайт**.
3. Тривиальный DoS: один злоумышленник отправляет 5 запросов и все формы сайта отдают `429` десять минут. Повторять бесконечно.
4. Одновременно теряется вся аналитическая ценность IP в логах.

**Исправление** — `astro.config.mjs`:

```js
export default defineConfig({
	site: 'https://anrotrip.ru',
	security: {
		allowedDomains: [
			{ hostname: 'anrotrip.ru', protocol: 'https' },
			{ hostname: 'www.anrotrip.ru', protocol: 'https' },
		],
	},
	// ...
});
```

Для dev/preview добавить `localhost` через условие по `process.env.NODE_ENV`.

**Обязательная проверка после фикса:** залогировать `clientAddress` на staging и убедиться, что приходит реальный IP клиента, а не `172.x`. Если Cloudflare, то XFF будет содержать цепочку — Astro берёт первый элемент, что корректно.

---

### P0-2. `bodySizeLimit` по умолчанию 1 GB — memory DoS на POST /api/*

**Файл:** `astro.config.mjs:26`

```js
// node_modules/@astrojs/node/dist/index.js:70
bodySizeLimit: userOptions.bodySizeLimit ?? 1024 * 1024 * 1024,   // 1 GB
```

Все три эндпоинта читают тело **до** валидации zod (`src/lib/api-request.ts:16` — `request.formData()`). Максимальное осмысленное тело — отзыв 8000 символов, т.е. < 32 KB. Сейчас можно залить гигабайт в память процесса.

**Исправление:**

```js
adapter: node({ mode: 'standalone', bodySizeLimit: 64 * 1024 }),
```

Плюс лимит на уровне Caddy: `request_body { max_size 64KB }`.

---

### P0-3. Caddy не запустится: `trusted_proxies cloudflare` требует плагина

**Файл:** `Caddyfile:5`, `compose.yml:7`

```
trusted_proxies cloudflare
```

IP-источник `cloudflare` — это **сторонний модуль** (`caddy-cloudflare-ip`), которого нет в официальном образе `caddy:2-alpine`, указанном в `compose.yml:7`. Caddy отвергнет конфиг при старте (`unknown IP source module`).

Это, вероятно, связано с P0-1: даже если бы `allowedDomains` был задан, реальный IP клиента без корректного `trusted_proxies` в Caddy всё равно не дошёл бы правильно.

**Исправление (вариант A, без плагинов)** — статические диапазоны Cloudflare:

```
trusted_proxies static 173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 \
  103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 \
  188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 \
  104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22 \
  2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 \
  2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32
```

**Вариант B** — собрать свой образ через `xcaddy` с модулем `caddy-cloudflare-ip` (автообновление списка).

**Статус (2026-09-06):** ✅ исправлено в репозитории — см. журнал **0.1**. VPS/prod ещё нет; [anrotrip.ru](https://anrotrip.ru/) — старый сайт. Перед первым деплоем: `caddy validate` на VPS.

---

### P0-4. Оптимизация изображений не выполняется в production-сборке

**Файл:** `Dockerfile:14-15`

```dockerfile
# Оптимизация изображений + astro build (prebuild → build)
RUN corepack enable && pnpm exec astro build
```

`pnpm exec astro build` вызывает бинарник напрямую и **обходит lifecycle-хуки**. Хук `prebuild` (`package.json:15` → `pnpm optimize:images`) не запускается никогда. Комментарий в Dockerfile утверждает обратное — то есть все, кто читал этот файл, были уверены, что оптимизация работает.

**Исправление:**

```dockerfile
RUN pnpm optimize:images && pnpm exec astro build
```

или просто `RUN pnpm build` (тогда хук отработает).

---

### P0-5. Host header injection в canonical / og:image

**Файл:** `src/lib/site-urls.ts:62-69`

```ts
const xfHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
const xfProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
if (xfHost) {
	return `${xfProto || 'https'}://${xfHost}`;
}
```

`X-Forwarded-Host` берётся без какой-либо проверки и попадает в `<link rel="canonical">`, `og:url`, `og:image`, JSON-LD. Если заголовок удастся протащить (прямой доступ к порту 4321, misconfig прокси, промежуточный CDN, который не перезаписывает заголовок), атакующий подменяет canonical на свой домен — классическая схема SEO-отравления и фишинга через превью ссылок.

Функция написана в обход механизма Astro 7 (`Astro.url` уже умеет валидировать forwarded-заголовки по `allowedDomains`).

**Исправление:** whitelist внутри функции + переход на `Astro.url` после фикса P0-1:

```ts
const ALLOWED_HOSTS = new Set(['anrotrip.ru', 'www.anrotrip.ru']);

export function getPublicOrigin(
	request: Request,
	fallbackOrigin: string,
	siteOrigin?: string,
): string {
	const xfHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
	if (xfHost && ALLOWED_HOSTS.has(xfHost.split(':')[0])) {
		const xfProto = request.headers
			.get('x-forwarded-proto')
			?.split(',')[0]
			?.trim();
		return `${xfProto === 'http' ? 'http' : 'https'}://${xfHost}`;
	}
	// ... тот же fallback, но с проверкой host по whitelist
}
```

Dev-туннели (для которых функция и писалась) разрешить только при `NODE_ENV !== 'production'`.

---

### P0-6. Вся документация и agent-контекст вне версионного контроля

**Файл:** `.gitignore:26-42`

```
.cursor/
.qwen/
.agents/
.serena/
.doc/
AGENTS.md
QWEN.md
.ai-factory.json
scripts/*
!scripts/optimize-images.mjs
```

Из репозитория исключены: **все 40 файлов `.doc/`**, `AGENTS.md`, `.specify/memory/constitution.md`, `.ai-factory.json`, `.cursor/skills/`, а также `scripts/typograf-blog.mjs` и `scripts/skin-tone-transfer.mjs`.

Последствия:

- Потеря машины / переустановка / `git clone` в другом месте = **потеря всей документации проекта** (это ~350 KB аналитики, планов, чеклистов, накопленных за полгода).
- Нет истории изменений документации — невозможно понять, когда и почему решение принято.
- Cloud-агенты и CI работают с checkout из git и **не видят `AGENTS.md`** → игнорируют правила «Header заморожен», «Tailwind v4 синтаксис», «не менять `cssMinify`». Это прямой риск регрессий от автоматизации.
- `scripts/typograf-blog.mjs` не попадает в образ, при этом `package.json:19` объявляет команду `typograf:blog` — на любой чистой машине она сломается.

**Исправление:** версионировать `AGENTS.md`, `.doc/`, `.specify/`, `.ai-factory.json`, `scripts/*`. Оставить в `.gitignore` только реально приватное: `.env`, `.env.*`, кэши редакторов, `.history/`. Если содержимое `.doc/` не должно попадать в публичный репозиторий — это повод для приватного репозитория, а не для `.gitignore`.

> Примечание для оценки других отчётов: из-за этой настройки инструменты поиска, уважающие `.gitignore`, «не видят» `.doc/` и `scripts/typograf-blog.mjs` — файл существует, он просто не в индексе git.

---

### P0-7. Prod-образ раздут в 80 раз (401 MB devDependencies)

**Файл:** `Dockerfile:23-24`

```dockerfile
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
```

В runtime-слой копируются `typescript`, `cspell`, `@astrojs/check`, `typograf`, `prettier-plugin-astro`, весь `sharp` с бинарниками. Замер: полный `node_modules` — **401 MB**, только production — **~5,1 MB**.

Это не только размер образа и время деплоя, но и площадь атаки: любая CVE в dev-зависимости становится CVE в проде.

**Исправление:**

```dockerfile
# в builder-стадии, после сборки
RUN pnpm prune --prod
```

либо `pnpm deploy --legacy --prod /app/prod` и копировать `/app/prod/node_modules`.

---

## 3. Безопасность

### CSP: `'unsafe-inline'` в `script-src` обесценивает политику

**Файл:** `src/middleware.ts:9`

```
"script-src 'self' 'unsafe-inline' https://tourvisor.ru https://cdn.nemo.travel",
```

С `'unsafe-inline'` CSP не защищает от XSS вообще — а XSS-риск реален: 18 `is:inline` блоков манипулируют DOM, есть `onclick=` в атрибутах (`Reviews.astro:75`).

**Путь к nonce-CSP:**

1. Генерировать nonce в middleware: `crypto.randomUUID()` → `context.locals.cspNonce`.
2. Прокинуть `nonce={Astro.locals.cspNonce}` во все `<script is:inline>`.
3. Убрать `onclick=` атрибуты (нужно и для a11y — см. A11Y-1).
4. Заменить `'unsafe-inline'` на `'nonce-...' 'strict-dynamic'`.

Промежуточный шаг, если nonce пока дорого: перевести самые крупные `is:inline` в bundled `<script>` (Astro хеширует их и они попадают в `'self'`), тогда `'unsafe-inline'` останется нужен только для JSON-LD (`<script type="application/ld+json">` — не исполняемый, но CSP его всё равно проверяет; для него достаточно nonce).

### CSP: недостающие директивы

Добавить в `src/middleware.ts`:

```
"object-src 'none'",                    // блокирует <object>/<embed>/plugin-XSS
"frame-src 'self' https://tourvisor.ru",// Tourvisor может монтировать iframe; сейчас упал бы на default-src
"worker-src 'self'",
"manifest-src 'self'",
"upgrade-insecure-requests",
```

`img-src 'self' data: https: blob:` — `https:` разрешает любой хост. Сузить до `'self' data: blob: https://avatars.mds.yandex.net` (или до конкретных нужных доменов), если внешние картинки вообще используются.

### Недостающие заголовки

**Файлы:** `src/middleware.ts:22-26`, `Caddyfile:7-13`

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-Permitted-Cross-Domain-Policies: none
Permissions-Policy: ... payment=(), usb=(), interest-cohort=()
```

`Permissions-Policy` сейчас закрывает только camera/microphone/geolocation.

### HTML-ответы без `Cache-Control`

**Файл:** `src/middleware.ts`

SSR-страницы отдаются без `Cache-Control`. Cloudflare и промежуточные прокси могут закешировать HTML по своим эвристикам. Явно задать:

```ts
const ct = response.headers.get('content-type') ?? '';
if (ct.includes('text/html') && !response.headers.has('Cache-Control')) {
	response.headers.set('Cache-Control', 'no-store, must-revalidate');
}
```

После перевода статики на `prerender` — для неё `public, max-age=3600, stale-while-revalidate=86400`.

### Rate-limit: in-memory, привязан к процессу

**Файл:** `src/lib/mailer.ts:90-122`

Реализация корректная (есть cleanup, `unref()`), но:

- перезапуск контейнера сбрасывает счётчики;
- при масштабировании на 2+ реплики лимит делится на реплики;
- лимит общий на все три формы (это скорее плюс).

Пока одна реплика — приемлемо. Зафиксировать в документации как осознанное ограничение; при росте — Redis или `rate_limit` на уровне Caddy (модуль `caddy-ratelimit`).

### Валидация env только в момент отправки

**Файл:** `src/lib/mailer.ts:39-42`

```ts
if (!host) throw new Error('SMTP_HOST не задан');
```

Проверка срабатывает при первой заявке, а не при старте. Если `SMTP_PASS` не проброшен в контейнер, узнаем об этом из потерянной заявки клиента.

**Исправление:** `src/lib/env.ts` с zod-схемой, импортируемый в middleware (выполняется при старте) — fail fast. Telegram-переменные оставить опциональными (`mailer.ts:71` молча пропускает — это правильно).

### `transporter` создаётся на каждую заявку

**Файл:** `src/lib/mailer.ts:44-49`

Новое TLS-соединение на каждый запрос. Вынести в модульный синглтон с `pool: true` — быстрее и меньше нагрузки на SMTP Яндекса.

### Прочее

- **Нет `/.well-known/security.txt`** (RFC 9116) — добавить в `public/`.
- **Нет CSP-репортинга** — `report-to` + endpoint помог бы увидеть, что реально ломается перед переходом на строгую политику.
- `mirror-gitflic.yml:19` — токен в URL команды `git push`. Попадёт в `ps`/логи на раннере. Использовать `git remote set-url` с credential helper или `env`-переменную.
- `.env` есть на диске и корректно в `.gitignore` — **утечек в git нет** (`git ls-files | grep env` → только `.env.example`, `src/env.d.ts`). ✅

---

## 4. Инфраструктура, Docker, CI/CD

### Dockerfile

| Проблема                      | Файл                 | Исправление                                                                                           |
| ----------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| `prebuild` не запускается     | `Dockerfile:15`      | P0-4                                                                                                  |
| devDeps в runner (401 MB)     | `Dockerfile:24`      | P0-7                                                                                                  |
| Нет init-процесса             | `Dockerfile:37`      | `dumb-init`/`tini` — иначе `SIGTERM` не доходит до Node, деплой ждёт 10 с таймаута на каждом рестарте |
| Базовый образ не по digest    | `Dockerfile:2,10,17` | `node:22.23-alpine@sha256:...` для воспроизводимости                                                  |
| `.dockerignore` неполный      | `.dockerignore`      | добавить `.ai-factory`, `*.md`, `.vscode`, `*.code-workspace`                                         |
| Дублирующий `corepack enable` | `Dockerfile:4,6`     | оставить один                                                                                         |

`HEALTHCHECK` через `wget` корректен — BusyBox wget есть в Alpine. ✅ Non-root пользователь есть. ✅

### compose.yml

| Проблема                                      | Исправление                                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Нет `deploy.resources.limits`                 | `mem_limit`/`cpus` — иначе утечка в Node положит весь VPS                                                       |
| Нет ротации логов                             | `logging: { driver: json-file, options: { max-size: 10m, max-file: 3 } }`                                       |
| Нет `read_only: true` + `tmpfs` для app       | Astro 7 включает file-session storage (видно в логе `pnpm check`) — нужен writable путь, учесть при `read_only` |
| `compose.local.yml` без `restart`/healthcheck | привести к паритету с prod                                                                                      |
| Нет `security_opt: no-new-privileges`         | добавить обоим сервисам                                                                                         |

### GitHub Actions

**Файл:** `.github/workflows/deploy.yml`

| Проблема                                   | Строка     | Исправление                                                                                                                                             |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Нет CI-проверки качества**               | —          | отдельный job `pnpm install --frozen-lockfile && pnpm check` **до** сборки образа; сейчас образ собирается и публикуется даже если код не компилируется |
| Actions не запинены на SHA                 | 27, 30, 61 | `actions/checkout@<sha> # v4` — защита от supply-chain                                                                                                  |
| `docker build` без buildx-кэша             | 37-41      | `docker/build-push-action@<sha>` + `cache-from/to: type=gha` — сборка с 3–5 мин до ~40 с                                                                |
| Нет `provenance`/`sbom`                    | 37-41      | `provenance: true`, `sbom: true` в build-push-action                                                                                                    |
| Нет `concurrency`                          | —          | `concurrency: { group: deploy-${{ github.ref }}, cancel-in-progress: true }`                                                                            |
| `--all-tags` при push                      | 44         | пушить явные теги `:sha-...` и `:latest`                                                                                                                |
| Билд с `main-design-green` пушит `:latest` | 5          | ограничить `:latest` только `main`, иначе ветка перезапишет prod-тег                                                                                    |
| Нет `environment:` с protection rules      | 55         | `environment: production` + required reviewers                                                                                                          |
| Нет health-gate после деплоя               | 62-76      | `curl -fsS https://anrotrip.ru/                                                                                                                         |     | rollback` |

`permissions` заданы минимально (`contents: read`, `packages: write`) ✅. Деплой за `workflow_dispatch` с явным `deploy: true` ✅. Dependabot настроен с группировкой ✅.

### Отсутствующий тулинг

| Нет                                       | Зачем нужно                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Линтер (`oxlint` / `eslint-plugin-astro`) | `pnpm check` проверяет только типы; a11y-баги вроде `div onclick` линтер поймал бы автоматически |
| `prettier` + `pnpm format`                | `prettier-plugin-astro` в devDeps есть, конфига и скрипта нет                                    |
| `.editorconfig`                           | в `package.json` табы, в `astro.config.mjs` — 2 пробела                                          |
| Pre-commit hook (`lefthook`)              | `pnpm check` + format на staged                                                                  |
| Lighthouse CI                             | без него регрессии LCP/CLS невидимы                                                              |
| Playwright smoke-тесты                    | 3 формы + модалки + меню — нулевое покрытие                                                      |
| `pnpm spellcheck` покрывает 2 файла       | `package.json:12` — расширить на `src/**/*.{astro,md}`                                           |

### Версии Node

`.nvmrc`, `.node-version`, `.fnmrc`, `.mise.toml`, `pnpm-workspace.yaml` — все `22.23.2` ✅. Расхождение: `package.json` `engines.node: ^22.19.0` и Dockerfile `22.23-alpine`. Привести `engines` к `>=22.23.0 <23`.

---

## 5. Производительность

### Замеры

| Что                                 | Размер                                   |
| ----------------------------------- | ---------------------------------------- |
| `src/assets/`                       | 3,5 MB                                   |
| `dist/`                             | 8,5 MB                                   |
| `global.css` (исходник)             | 58 KB / 1982 строки                      |
| `dist/client/_astro/typograf.*.css` | **363 KB** raw · 55 KB gzip · 44 KB br   |
| Bundled JS                          | 28 KB (ClientRouter 16 KB + Header 9 KB) |
| Inline JS на HTML-ответ             | **~68 KB**                               |
| WOFF2 в `dist/`                     | **828 KB** (78 файлов)                   |

Топ-5 ассетов: `tours/thailand.webp` 235 KB (1200×655), `tours/antalya.webp` 196 KB, `welcome/welcome.webp` 174 KB, `team/team.webp` 174 KB, `tours/egypt.webp` 154 KB.

### PERF-1. `opacity: 0` на `<html>`/`<body>` откладывает LCP на 500 мс

**Файл:** `src/layouts/Layout.astro:294-298`

```js
if (!prefersReduced && !sameOriginReferrer) {
  d.documentElement.style.opacity = '0';
  d.body.style.opacity = '0';
  d.documentElement.style.transition = 'opacity 0.5s ease';
```

Условие `!sameOriginReferrer` означает, что fade применяется именно к **холодным заходам** — то есть ровно к тем визитам, которые измеряет Google в Core Web Vitals. Hero имеет `fetchpriority="high"` и preload, но остаётся невидимым до `DOMContentLoaded` + 500 мс анимации. Это чистый проигрыш в LCP ради визуального эффекта, которого пользователь всё равно не видит (он видит пустой экран).

**Исправление:** убрать fade с корневых элементов. Если эффект нужен — анимировать отдельный overlay-слой поверх контента (`position: fixed` + `pointer-events: none`), не скрывая LCP-элемент.

### PERF-2. CSS 363 KB: Font Awesome + полные subset'ы шрифтов + `cssMinify: false`

**Файлы:** `src/styles/global.css:4-15`, `astro.config.mjs:29-33`

```css
@import '@fontsource/inter/400.css'; /* весь latin+cyrillic+greek+vietnamese */
@import '@fontsource/montserrat/600.css';
@import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
@import '@fortawesome/fontawesome-free/css/solid.min.css';
@import '@fortawesome/fontawesome-free/css/regular.min.css';
@import '@fortawesome/fontawesome-free/css/brands.min.css';
```

Три независимых множителя:

1. **Font Awesome целиком** — 4 CSS-файла с тысячами иконок + ~252 KB woff2. Проект использует единицы иконок, и в стеке уже есть `astro-iconify` для SVG.
2. **Полные subset'ы @fontsource** — 6 весов × 7 subset'ов = 78 woff2 (828 KB). Русскому сайту нужны `cyrillic` + `latin`. Замена `@fontsource/inter/400.css` → `@fontsource/inter/cyrillic-400.css` + `latin-400.css` сокращает CSS на порядок (263 B vs 2654 B на вес).
3. **`cssMinify: false`** — workaround для `backdrop-blur`. Он умножает результат первых двух пунктов.

Порядок действий: сначала убрать FA и лишние subset'ы (это ~80 % выигрыша и без риска), затем вернуться к `cssMinify`. Для blur корректнее точечное решение — вынести `backdrop-filter` в отдельный CSS-файл, не проходящий через минификатор, или `@supports`-обёртку, устойчивую к минификации. Полное отключение минификации всего бандла — слишком широкий инструмент.

> `AGENTS.md` запрещает менять `cssMinify` без явной просьбы. Пункты 1 и 2 запрет не затрагивают — делать их можно сразу.

### PERF-3. Nemo блокирует рендер первого экрана

**Файл:** `src/components/widgets/NemoSearch.astro:20-22, 52-56`

```astro
<link
	rel="stylesheet"
	href={`${NEMO_CDN_BASE}/flights.search.widget.min.css`}
/>
<script is:inline defer src={`${NEMO_CDN_BASE}/flights.search.widget.min.js`}
></script>
```

`<link rel="stylesheet">` на сторонний CDN — render-blocking запрос к внешнему хосту в критическом пути. Инициализация на `DOMContentLoaded`, без ожидания видимости.

Показательно, что Tourvisor рядом сделан правильно — lazy по клику на таб с prefetch на hover (`SearchWidget.astro:217-234`). Nemo нужно привести к тому же паттерну: `IntersectionObserver` на `#search-widget` либо `requestIdleCallback`. Плюс `preconnect` к `cdn.nemo.travel` (`index.astro:62` — сейчас preconnect только к `tourvisor.ru`).

### PERF-4. Статические страницы рендерятся на каждый запрос

Только блог имеет `export const prerender = true` (`blog/[...page].astro:13`, `blog/[...slug].astro:18`). Кандидаты на prerender: `privacy.astro`, `terms.astro`, `404.astro`, `index.astro`.

Дополнительно на **каждый** SSR-запрос выполняется файловая операция:

```50:56:src/layouts/Layout.astro
const ogImageVersion = await (async () => {
  for (const file of ['og-image.png', 'og-image.jpg']) {
    try {
      const st = await stat(join(process.cwd(), 'public', file));
      return String(Math.floor(st.mtimeMs / 1000));
```

`stat()` на диск ради cache-buster'а, который меняется только при пересборке. Вычислять на этапе сборки (import.meta.env / build-time константа).

### PERF-5. `astro-compressor` при SSR не даёт ничего

**Файл:** `astro.config.mjs:36`

Интеграция создала 34 файла `.br/.gz/.zst` в `dist/client/`, но:

- `@astrojs/node` standalone не отдаёт предсжатые файлы;
- Caddy работает через `reverse_proxy`, а не `file_server { precompressed }`;
- HTML при SSR вообще не проходит предсжатие (это документированное ограничение пакета).

То есть сжатие целиком обеспечивает `encode gzip` в Caddy, а интеграция только удлиняет сборку. **Либо** убрать `compressor()`, **либо** отдавать `/_astro/*` напрямую через Caddy `file_server` с `precompressed br gzip` (это ещё и снимет нагрузку с Node).

### PERF-6. Caddy: только gzip

**Файл:** `Caddyfile:2`

```
encode gzip
```

`encode zstd br gzip` даст ~20 % экономии на том же CSS (44 KB br против 55 KB gzip).

### PERF-7. Изображения

| Проблема                                    | Файл                                          | Исправление                                                                                               |
| ------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Hero отдаётся в 3840×2160                   | `Hero.astro:71-78`                            | `width={1920}` + `sizes="100vw"`; 4K-декодирование на мобильном — самая дорогая операция на первом экране |
| Нет AVIF нигде                              | все                                           | `<Picture formats={['avif','webp']}>` для Hero и туров                                                    |
| `tours/` исключены из оптимизации           | `scripts/optimize-images.mjs:28`              | убрать из SKIP — там 5 из топ-8 тяжёлых файлов                                                            |
| Нет `sizes`                                 | Team, OurPartners, JournalSection, blog cards | добавить (есть в PopularTours, Reviews, Awards)                                                           |
| Preload 3 картинок туров конкурирует с Hero | `index.astro:43-60`                           | убрать — они ниже первого экрана и отбирают полосу у LCP-ресурса                                          |
| `welcome.webp` 174 KB на fullscreen         | `cabinet.astro:50-57`                         | resize до 1920 + AVIF                                                                                     |

### PERF-8. Клиентский JS

`client:*` директивы не используются нигде (0 островов) — для этого сайта нормально. Но ~68 KB inline JS на каждый HTML-ответ не кешируется браузером **никогда**, в отличие от bundled-чанка с хешем. Топ: `Reviews.astro` 12,6 KB, `Layout.astro` anchor/blog-nav 11,9 KB, `SearchWidget.astro` 6,3 KB.

Перевод в bundled-модули даёт двойной выигрыш: кеширование между страницами + проверка типов в `pnpm check`.

Также: `ClientRouter` (16 KB) грузится на всех страницах, включая `/privacy`, `/terms`, `/404`, где переходов нет. `CookieBanner` + 3 модалки монтируются в DOM на legal-страницах без нужды (`Layout.astro:405-408`).

---

## 6. Доступность (a11y)

### A11Y-1. Карусель отзывов недоступна с клавиатуры

**Файл:** `src/components/Reviews.astro:73-76`

```astro
<div
	class="snap-start shrink-0 w-32 sm:w-36 group cursor-pointer"
	onclick={`openLightbox(${index})`}
>
</div>
```

`<div>` с `onclick`, без `tabindex`, без роли, без обработки Enter/Space. Для скринридера и клавиатурной навигации 8 отзывов просто не существуют. Плюс строковый `onclick` — это то, что заставляет держать `'unsafe-inline'` в CSP.

**Исправление:** `<button type="button" aria-label={`Открыть отзыв: ${item.title}`}>` + `addEventListener` вместо атрибута.

### A11Y-2. Карточки услуг About — то же самое

**Файл:** `src/components/About.astro:374-381, 574-580`

На `<768px` карточка открывает bottom sheet по click, будучи `<div>`. Bottom sheet (`About.astro:484-511`) не объявлен диалогом.

### A11Y-3. Модалки без `role="dialog"` / `aria-modal`

**Файлы:** `CallbackModal.astro:10-13`, `GiftModal.astro:11-14`, `Reviews.astro:157-160` (lightbox), `Reviews.astro:254-256` (форма)

Focus trap и Escape в Callback/Gift реализованы (`CallbackModal.astro:137-210`) — но без `role="dialog" aria-modal="true" aria-labelledby="..."` скринридер не переключается в modal-режим и продолжает озвучивать фон. `Header.astro:417-419` и `ExternalReviewsRow.astro:203-205` сделаны правильно — есть с чего копировать.

### A11Y-4. Форма отзыва в Reviews — без focus trap и restore

**Файл:** `src/components/Reviews.astro:618-646`

Tab уходит под overlay, фокус не возвращается на `#open-review-form`. В `CallbackModal.astro:167-205` это уже написано — вынести в `src/lib/client/focus-trap.ts` и переиспользовать.

### A11Y-5. Контраст ниже WCAG AA

| Цвет                      | Фон      | Ratio      | Норма | Где                                                                          |
| ------------------------- | -------- | ---------- | ----- | ---------------------------------------------------------------------------- |
| `#00abb3` (primary)       | белый    | **2,81:1** | 4,5:1 | `Hero.astro:252` (13px), `global.css:611`                                    |
| `#33bfc6` (primary-light) | белый    | **2,23:1** | 4,5:1 | `.section-badge__label`                                                      |
| `#9ca3af` (gray-400)      | белый    | **2,54:1** | 4,5:1 | `CallbackModal.astro:51,96`, `Reviews.astro:273`, `blog/[...page].astro:435` |
| `white/40`                | gray-950 | **3,74:1** | 4,5:1 | `Reviews.astro:98` (11px)                                                    |

Для мелкого текста: `text-primary-dark` (#008a91), `text-gray-500`/`600`, `text-white/70`+.

### A11Y-6. Прочее

| Проблема                                                  | Файл                                                                              | Исправление                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `#menu-toggle` без `aria-controls`, drawer без focus trap | `Header.astro:375-380, 409-419`                                                   | `aria-controls="mobile-menu"` + trap ⚠️ Header заморожен — согласовать |
| `ui/Modal.astro` — `<dialog>` без `aria-labelledby`       | `Modal.astro:13-35`                                                               | `id` на `<h3>` + связать                                               |
| Рейтинг в ReviewModal не `required`, звёзды без текста    | `ReviewModal.astro:44-67`                                                         | `required` + `<span class="sr-only">{star} из 5</span>`                |
| Success-блоки без `aria-live`                             | `CallbackModal.astro:116-124`, `GiftModal.astro:116-124`, `Reviews.astro:359-367` | `role="status" aria-live="polite"`                                     |
| ScrollProgress без роли                                   | `ScrollProgress.astro:6-10`                                                       | `role="progressbar"` + `aria-valuenow`                                 |
| Cookie banner без focus trap/Escape/initial focus         | `CookieBanner.astro:6-12, 61-104`                                                 | есть `role="dialog"` и labels, добавить управление фокусом             |
| Логотип на главной `href="#"`                             | `Header.astro:178-179`                                                            | `aria-label="ANRO TRIP — наверх страницы"` ⚠️ Header заморожен         |
| Нет `inputmode="tel"`                                     | `CallbackModal.astro:75-83`, `cabinet.astro:110-117`, `Reviews.astro:291-298`     | добавить                                                               |
| Нет `aria-current` в навигации                            | `Header.astro`                                                                    | `aria-current="page"` ⚠️ заморожен                                     |
| Skip-link ведёт на `<div id="content">`                   | `Layout.astro:394-399`                                                            | лучше `#main` на `<main>`                                              |

### A11Y-7. Логика ScrollToTop инвертирована

**Файл:** `src/components/ScrollToTop.astro:67-88`

Кнопка появляется при `docHeight - scrollPos < 50`, т.е. **у самого низа страницы**, где она уже не нужна. При прокрутке середины длинной страницы (главная, блог) её нет. Похоже на баг, а не на замысел — проверить с владельцем.

### Сделано правильно ✅

skip-link, `lang="ru"`, landmarks, FAQ-аккордеон с `aria-expanded`/`aria-controls`, focus trap в Callback/Gift, глобальный `prefers-reduced-motion` (`global.css:1220-1232`), дубли marquee-треков с `aria-hidden`, `:focus-visible` ring во всех формах, sr-only labels в cabinet, один `<h1>` на страницу.

---

## 7. SEO и веб-стандарты

### SEO-1. Главная и legal-страницы отсутствуют в sitemap

**Файл:** `astro.config.mjs:24-36`

`@astrojs/sitemap` при `output: 'server'` включает только prerendered-маршруты. Prerender есть только у блога → в `sitemap-index.xml` попадает блог, но **не `/`, `/privacy`, `/terms`**.

Решается тем же переводом страниц на `prerender = true` (PERF-4) — тогда sitemap наполнится автоматически. Быстрый вариант — `customPages`.

Также стоит исключить `/cabinet` из sitemap (`filter`), он `noindex` (`cabinet.astro:24`) и закрыт в `robots.txt`.

### SEO-2. Пагинация блога: один canonical на все страницы

**Файл:** `src/pages/blog/[...page].astro:70-73`

```astro
<Layout title="Журнал о путешествиях | ANRO TRIP" canonicalURL={blogIndexUrl}
```

`/blog/2` отдаёт `canonical` на `/blog` → страницы 2+ выпадают из индекса вместе со всеми статьями, которые есть только на них. Нет `rel="prev"/"next"`, title не различается.

**Исправление:** canonical = текущий URL, `title` с `Страница ${page.currentPage}`, `<link rel="prev/next">`.

### SEO-3. Главная без собственного description

**Файл:** `src/pages/index.astro:34`

```astro
<Layout title="ANRO TRIP — Будь на высоте!" />
```

Берётся дефолт из `Layout.astro:38` (46 символов). Для главной коммерческого сайта это самая ценная строка в SERP. Нужны 120–160 символов с услугами и гео.

Также `top-destinations-2026.md:3-6` — description ~208 символов, обрежется.

### SEO-4. Structured data: незаполненный потенциал

**Файлы:** `src/layouts/Layout.astro:83-177`, `src/lib/schema-blog.ts`

Есть: `TravelAgency`, два `LocalBusiness`, `FAQPage`, `BlogPosting`, `BreadcrumbList`. Отсутствует:

- **`aggregateRating`** — при том, что данные уже лежат в `external-reviews.ts:37-40` (5.0, 47 оценок). Это самый дешёвый rich snippet, который тут можно получить: звёзды в выдаче.
- `geo` / `GeoCoordinates` для офисов (координаты есть в ссылке `Contacts.astro:157`).
- `openingHoursSpecification` и `streetAddress` для Екатеринбурга (`Layout.astro:122-139`).
- `WebSite` + `SearchAction`.
- `wordCount`, `articleSection` в `BlogPosting` (`schema-blog.ts:37-60`).

**NAP-рассинхрон** — критично для локального SEO: в schema `telephone: '+78002224473'`, в Hero/FAQ `+7 (922) 026-70-59`, в `AGENTS.md` email `online@`, в Footer/Contacts `anro@`. Поисковики сверяют NAP между сайтом, Яндекс.Справочником и 2ГИС; расхождение снижает доверие к карточке. Нужен единый источник — `src/data/company.ts`, из которого читают и schema, и компоненты, и документация.

### SEO-5. 404 без `noindex`

**Файл:** `src/pages/404.astro:8-14` — добавить `<meta name="robots" content="noindex, nofollow">` (в `cabinet.astro:24` это сделано).

### SEO-6. Блог: 6 из 7 статей без изображений

`content.config.ts:14-16` делает `heroImage`/`cardImage` опциональными, реально заполнено только у `top-destinations-2026.md`. Остальные используют placeholder и общий `/og-image.jpg` вместо уникального og:image — слабые превью при расшаривании и в выдаче.

Также в схему стоит добавить `imageAlt` (сейчас alt для hero не задаётся отдельно) и `draft: z.boolean().default(false)` с фильтрацией в `getCollection` — это уже запланировано в `.doc/max-blog-import-plan.md`.

### SEO-7. Иконки и manifest

**Файл:** `src/layouts/Layout.astro:207-209`

```astro
<link rel="icon" type="image/png" href={favicon.src} />
<link rel="apple-touch-icon" href={favicon.src} />
```

`apple-touch-icon` — тот же мелкий favicon вместо 180×180. Нет `manifest.webmanifest`, нет `theme-color`. При добавлении на домашний экран iOS отрисует размытую иконку.

Нужны: PNG 180×180, 192×192, 512×512, `site.webmanifest`, `<meta name="theme-color" content="#00abb3">`. `.doc/pwa-plan.md` описывает полноценный PWA — здесь достаточно первого шага (иконки + manifest без service worker).

### SEO-8. Мелкое

- `privacy.astro:8`, `terms.astro:8` — hardcoded `const siteUrl = 'https://anrotrip.ru'` вместо `getPublicOrigin()`/`Astro.site`.
- `Layout.astro:40` (`/og-image.png`) vs `Layout.astro:90-91` (schema logo `/og-image.jpg`) — разные файлы для одной сущности. Проверить, что фактические размеры `og-image.png` совпадают с заявленными 1200×630 (`Layout.astro:223-224`).
- `robots.txt` корректен ✅ (`/api/`, `/cabinet` закрыты, sitemap указан, директива `Host` для Яндекса).

---

## 8. Архитектура и качество кода

### Размеры файлов

| Файл                          | Строк                 |
| ----------------------------- | --------------------- |
| `Header.astro`                | **1233** ⚠️ заморожен |
| `Layout.astro`                | 883                   |
| `Reviews.astro`               | 711                   |
| `About.astro`                 | 640                   |
| `OfficeWidget.astro`          | 602                   |
| `blog/[...page].astro`        | 590                   |
| `Awards.astro`                | 504                   |
| `Footer.astro`                | 463                   |
| `Hero.astro`                  | 455                   |
| `ExternalReviewsRow.astro`    | 441                   |
| `blog/[...slug].astro`        | 415                   |
| `Team.astro`                  | 353                   |
| `privacy.astro` / `FAQ.astro` | 327                   |
| `SearchWidget.astro`          | 310                   |

### ARCH-1. Четыре копии одного submit-обработчика

| Файл                  | Endpoint        | Строки  |
| --------------------- | --------------- | ------- |
| `CallbackModal.astro` | `/api/callback` | 224-258 |
| `GiftModal.astro`     | `/api/gift`     | 231-260 |
| `ReviewModal.astro`   | `/api/review`   | 111-142 |
| `Reviews.astro`       | `/api/review`   | 656-687 |

Во всех четырёх — одни и те же дефекты:

```ts
const res = await fetch('/api/callback', {/* ... */});
const data = await res.json(); // ← при 500 с HTML-телом падает SyntaxError
```

1. Нет проверки `res.ok` перед `res.json()` — ответ 500/502 с HTML даёт `SyntaxError` и пользователь видит generic-ошибку вместо осмысленной.
2. Нет `AbortController`/timeout — на плохой сети кнопка висит в состоянии загрузки бесконечно.
3. Нет обработки offline.
4. Hardcoded `/api/*` — при этом в `src/lib/api-url.ts:5` есть готовая `siteApi()`, которая **не используется ни разу**.

Один модуль `src/lib/client/form-submit.ts` устраняет 4 дубля и 4 класса баг одновременно — лучший ROI в проекте.

### ARCH-2. Мёртвый и осиротевший код

| Что                                                                    | Статус                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `widgets/TourvisorSearch.astro` (80+ строк)                            | **0 импортов** — Tourvisor грузится inline в `SearchWidget.astro:180+`                                                                                                                                                         |
| `ReviewModal.astro`                                                    | Монтируется в `Layout.astro:408`, но событие `open-modal-review-modal` **не диспатчится нигде**. При этом дублирует поля формы из `Reviews.astro:254-370`. Лишний DOM на каждой странице + ловушка для следующего разработчика |
| `siteApi` (`api-url.ts`)                                               | не используется                                                                                                                                                                                                                |
| `protectBrandName`, `typografHtml`, `typografInstance` (`typograf.ts`) | не используются                                                                                                                                                                                                                |
| ~10 CSS-классов                                                        | `.deep-shadow`, `.btn-magnetic`, `.hero-logo-spin`, `.header-logo-spin`, `.gift-cta-btn`, `.about-services-pill`, `.about-avia-card`, `.reveal-from-left/right/scale`, `.shake-error`, `.hero-kenburns` — ~150–200 строк       |

### ARCH-3. Дублирование клиентской логики

| Логика                      | Определение                   | Дубли/вызовы                                                                                                      |
| --------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `lockScroll`/`unlockScroll` | `Layout.astro:854-879`        | CallbackModal:170,203 · GiftModal:170,205 · Reviews:472,487,622,643 · Awards:422,441 · ExternalReviewsRow:360,410 |
| `smoothScrollTo`            | `Layout.astro:337-362`        | Header:740,746,759 · Hero:347,409 · PopularTours:184 · ScrollToTop:107                                            |
| Focus trap                  | `CallbackModal.astro:137-162` | полный дубль в `GiftModal.astro:132-159`, частичный в `Reviews.astro:405`                                         |
| Marquee                     | `Partners.astro:119-191`      | идентичен `OurPartners.astro:127-208`                                                                             |
| `socials[]` массив          | `Footer.astro:39-89`          | дубль в `FooterMinimal.astro:33-83`                                                                               |
| `.section-badge` разметка   | —                             | 12+ файлов                                                                                                        |

Обращает внимание паттерн: функции определены в `Layout.astro` и вызываются через `window.*` из компонентов. Это работает, но создаёт неявную зависимость, невидимую для TypeScript и для читателя компонента. Явные ES-модули в `src/lib/client/` решают и это.

### ARCH-4. Контент захардкожен в компонентах

| Домен              | Где                        | Записей |
| ------------------ | -------------------------- | ------- |
| Team               | `Team.astro:42-66`         | **23**  |
| About services     | `About.astro:12-64`        | 9       |
| Header nav         | `Header.astro:45-86`       | 12+     |
| Partners (клиенты) | `Partners.astro:14-25`     | 10      |
| Review scans       | `Reviews.astro:24-33`      | 8       |
| FAQ                | `FAQ.astro:5-56`           | 7       |
| Trust badges       | `TrustBadges.astro:8-55`   | 5       |
| Tours              | `PopularTours.astro:11-48` | 4       |
| Awards             | `Awards.astro:52-104`      | 4       |
| Directions         | `About.astro:69-91`        | 3       |

Блог (`content.config.ts` + 7 md) и внешние отзывы (`external-reviews.ts`) сделаны как data layer — есть образец. Остальное смешано с разметкой: чтобы поправить телефон сотрудника, нужно открыть 353-строчный компонент.

Разделение: `src/data/*.ts` для данных с `ImageMetadata` (team, tours, partners, awards — импорты картинок нужны для Astro `<Image>`), Content Collections для текстового контента, который может редактировать контент-менеджер (FAQ).

### ARCH-5. Типизация клиента и env

- **Нет `ImportMetaEnv`** — `PUBLIC_*` переменные не типизированы, опечатка в имени даст `undefined` молча.
- **Два файла с augmentation `Window`**: `src/env.d.ts:4-9` (2 поля) и `src/types/window.d.ts` (~22 поля). Разделение без причины, `smoothScrollTo` не в том файле, где остальное.
- **18 `is:inline` блоков (~800 строк)** не проходят `tsc` — то есть `pnpm check` с его «0 ошибок» покрывает примерно 40 % клиентского кода. `Header.astro` использует bundled typed `<script>` — правильный образец.

Положительное: `any` — 0, `@ts-ignore` — 0, non-null assertions — 0, серверный код полностью типизирован ✅.

### ARCH-6. `mailer.ts` смешивает три ответственности

295 строк: SMTP-транспорт + Telegram + rate-limit + HTML-шаблон письма. Разнести: `mailer.ts` (транспорт), `notify-telegram.ts`, `rate-limit.ts`, `email-template.ts`. Rate-limit особенно — он не имеет отношения к почте, но живёт в `mailer.ts` и импортируется API-роутами оттуда.

---

## 9. Дизайн-система

### Что есть

`@theme` (`global.css:45-72`): 10 цветов бренда, 2 семейства шрифтов, `--breakpoint-nav: 90rem`, 3 длительности + easing. `@utility z-modal`. Motion-переменные в `:root:419-427`. Единый контейнер `container mx-auto px-4 sm:px-6 max-w-7xl` во всех секциях ✅. Единый вертикальный ритм `py-[50px]` ✅. Tailwind v4 синтаксис соблюдён: `bg-gradient-to-*` — 0, `flex-shrink-0` — 0, `theme()` — 0 ✅.

Dark mode осознанно отключён (`color-scheme: only light`, 0 `dark:` классов) — консистентно, полумер нет ✅.

### DS-1. Типографика и цвета живут в арбитражных значениях

| Категория                   | Количество                                 | Худшие места                                                                  |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `text-[Npx]`                | **67** (14 размеров: 7,8,9,10,11,13,15px…) | `Header.astro` (8–15px), `OfficeWidget.astro` (9×11px)                        |
| `bg-[#hex]` / `text-[#hex]` | 19 / 20                                    | Telegram `#2AABEE`, VK `#0077FF`, Yandex `#FC3F1D` в Header/Footer/blog share |
| `shadow-[...]`              | 31                                         | Hero, GiftSection, About CTA                                                  |
| `w-[...]`/`h-[...]`/calc    | 76 + 4                                     | `Hero.astro:107`                                                              |
| `[@media(...)]` в классах   | 27                                         | Header (`max-height:480px`)                                                   |
| `style=` атрибуты           | ~15                                        | blur-up, fluid font-size                                                      |
| `!important` в global.css   | 21                                         | blog overrides, modal fixes                                                   |

Один и тот же 10px записан как `text-[10px]` в компонентах и `text-[0.625rem]` в блоге. Токены нужны прежде всего для micro-типографики (7–11px) и брендовых цветов платформ:

```css
@theme {
	--text-micro: 0.625rem; /* 10px */
	--text-caption: 0.6875rem; /* 11px */
	--color-tg: #2aabee;
	--color-vk: #0077ff;
	--color-yandex: #fc3f1d;
}
```

### DS-2. Обход собственного z-index токена

**Файл:** `src/components/Reviews.astro:164` (и ещё 4 места)

```astro
class="absolute top-0 right-0 p-5 flex gap-3 z-2147483649"
```

`z-modal` определён как `2147483647` (максимум int32), а здесь `+2` — то есть значение, которое браузер уже не может интерпретировать как задумано. Это симптом: если приходится перебивать максимальный z-index, проблема в структуре слоёв, а не в числах. Нужна шкала (`--z-header`, `--z-overlay`, `--z-modal`, `--z-toast`), а `z-modal: 2147483647` заменить на разумные значения.

### DS-3. Props-интерфейсы непоследовательны

14 из 34 компонентов имеют `Props`. `class?: string` есть у About, PopularTours, Partners, FAQ — у остальных секций нет. `export interface Props` vs `interface Props` смешано. Callback/Gift-модалки монолитны без props, хотя различаются только endpoint'ом и подписями.

### DS-4. Смешение брейкпоинтов в Header

`nav:` (1440px) используется 16 раз, только в `Header.astro`. Внутри `nav:`-контекста встречаются `lg:text-[9px] xl:text-[10px]` — то есть два независимых набора брейкпоинтов управляют одним элементом. ⚠️ Header заморожен, править только с согласия владельца.

---

## 10. Актуальность документации

Документация обширна (40 файлов, ~350 KB) и в целом отражает проект, но систематически отстаёт по версиям после апгрейда на Astro 7 (коммит `45a2ce8`).

### Систематические расхождения версий

| Файл                                                          | Указано                                                 | Фактически                          |
| ------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `AGENTS.md:25`                                                | Astro 6.x                                               | **7.2.9**                           |
| `.specify/memory/constitution.md:15-19`                       | Astro ^6.1.8, Tailwind ^4.2.x, TS ^5.7.3, Node ^22.13.0 | **7.2.9 / 4.3.2 / 5.9.3 / 22.23.2** |
| `.doc/notes-blur-production.md:41`                            | Astro 6.x + Tailwind 4.2.x                              | **7.x + 4.3.x**                     |
| `.doc/anro-trip-guide-optimized.md:7`                         | Astro 5.16.13 + Tailwind 4.1.18                         | **7.2.9 / 4.3.2**                   |
| `.doc/audit-full-2026-04.md:24`, `.doc/project-roadmap.md:10` | Astro 6.x                                               | **7.x**                             |
| `.doc/SEO-чек-лист.md:13`, `project-roadmap.md:29`            | `astro-sitemap`                                         | **`@astrojs/sitemap`**              |

### Битые пути и маршруты

| Где                                                                                                          | Утверждение                                                     | Реальность                                    |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------- |
| `AGENTS.md:44`                                                                                               | `hero/… plane.avif`                                             | удалён (коммит `2bf8379`)                     |
| `AGENTS.md:49`                                                                                               | `awards/` — 3 изображения                                       | **16** (`maxx-voyage/` 12 + 4)                |
| `AGENTS.md:47`                                                                                               | только `partners/`                                              | есть ещё `our-partners/` (3 файла)            |
| `AGENTS.md:63`                                                                                               | `corp.astro` в `src/pages/`                                     | архив `src/_archive/corp/` (коммит `7d897db`) |
| `AGENTS.md:156`                                                                                              | `src/.env.example`                                              | корень: `.env.example`                        |
| `AGENTS.md:168-175`                                                                                          | таблица страниц                                                 | нет `/404`                                    |
| `anro-trip-guide-optimized.md:36,37,66,69`                                                                   | `plane.avif`, `dubai`, `pages/corp.astro`, `public/favicon.svg` | ничего из этого не существует                 |
| `site-analysis-full.md:14-15,33`                                                                             | Google Fonts preconnect, Hero AVIF                              | проект на `@fontsource`, hero — `world.webp`  |
| `Анализ-текста-сайта.md:29+`, `audit-mobile.md:3`, `testing-plan.md:12`, `commercial-resource-roadmap.md:39` | разделы/тесты для `/corp`                                       | маршрут не публикуется                        |

### Расхождение GitHub-организации

`server-vps-stack-plan.md:24,55,64`, `deploy-prep-checklist.md:61,81+` указывают образ `ghcr.io/hyperdevops/white_anrotrip`, а `gitflic-mirror.md` называет `hyperdevops` основным репозиторием, а `shkrndns` — зеркалом. Фактический `origin` — **`github.com/shkrndns/white_anrotrip`**, и `mirror-gitflic.yml:19` пушит в `gitflic.ru/project/shkrndns/`. Для деплой-документации это опасное расхождение: по инструкции можно задеплоить не тот образ.

### Расхождения в контактах (влияет и на SEO — см. SEO-4)

| Источник              | Значение                                                        |
| --------------------- | --------------------------------------------------------------- |
| `AGENTS.md:213`       | Telegram `@anrotrip`                                            |
| `Header.astro:25`     | `t.me/anro_trip`                                                |
| `AGENTS.md:214`       | email `online@anrotrip.ru`                                      |
| Footer / Contacts     | `anro@anrotrip.ru`                                              |
| `AGENTS.md:215`       | адрес — Екатеринбург                                            |
| `Contacts.astro`      | основной офис — **Челябинск**, Екатеринбург — представительство |
| `Layout.astro` schema | `+78002224473`                                                  |
| Hero / FAQ            | `+7 (922) 026-70-59`                                            |

Нужен единый канон в `src/data/company.ts` + ссылка на него из `AGENTS.md`.

### Устаревшие TODO (отмечены как невыполненные, но уже сделаны)

| Документ                        | TODO                                                       | Реальность                                              |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `project-roadmap.md:35-36`      | добавить OpenGraph, sitemap, robots                        | `Layout.astro`, `@astrojs/sitemap`, `public/robots.txt` |
| `project-roadmap.md` Фаза 4     | Nemo-виджет                                                | `NemoSearch.astro` + `SearchWidget.astro` на главной    |
| `project-roadmap.md:13`         | `/corp` ✅ готово                                          | архивирован                                             |
| `audit-full-2026-04.md:65-67`   | нужны OpenGraph, Schema.org, canonical, zod                | всё реализовано                                         |
| `security-baseline-package.md`  | CSP, HSTS, Origin-проверка                                 | `middleware.ts`, `security.ts`, `Caddyfile`             |
| `nemo-flights-widget-plan.md:3` | «Запланировано (Фаза 4)»                                   | виджет в проде                                          |
| `refactoring-plan.md`           | размеры Header 1248 / Reviews 672 / About 568 / Footer 435 | **1233 / 711 / 640 / 463**                              |

Устаревшие TODO хуже отсутствующих: агент или новый разработчик потратит время на уже сделанное.

### Консолидация

| Действие                            | Файлы                                                                                                                                       | Причина                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Архивировать** в `.doc/_archive/` | `anro-trip-guide-optimized.md`, `site-analysis-full.md`, `audit-full-2026-04.md`, `dev_site.md` (перепечатка чужой статьи), `SEO_trends.md` | массовые расхождения; ценность только историческая |
| **Объединить**                      | `audit-full-2026-04` + `technical-audit-checklist` + `site-analysis-full` → один живой техаудит                                             | три пересекающихся аудита разных дат               |
| **Объединить**                      | `security-audit-2026-07` + `security-baseline-package` + `security-hardening-checklist`                                                     | дублируют CSP/forms/VPS                            |
| **Объединить**                      | `design-overhaul-2026` + `design-report-2026`                                                                                               | один дизайн-цикл                                   |
| **Объединить**                      | `mobile-menu.md` → раздел в `header-frozen.md`                                                                                              | явная перекрёстная ссылка                          |
| **Дедуплицировать**                 | `.ai-factory/plans/feature-max-blog-drafts.md` vs `.doc/max-blog-import-plan.md`                                                            | одна тема, два плана                               |
| **Не трогать** ✅                   | `forms.md`, `SEO-чек-лист.md`, `technical-audit-checklist.md`, `header-frozen.md`, `legal-pages-review.md`, `analytics-cookies-plan.md`     | наиболее соответствуют коду                        |

### Недостающая документация

Astro 7 (миграция, `compressHTML`, `security.allowedDomains`) · `src/middleware.ts` и CSP · `src/lib/` (`security.ts`, `schema-blog.ts`, `site-urls.ts`, `api-url.ts`) · разделение `Partners` vs `OurPartners` · глобальные виджеты Layout (OfficeWidget, FavoritesWidget, ScrollProgress, CookieBanner) · `404.astro` · `content.config.ts` · `pnpm spellcheck` + `cspell.config.yaml` · `compose.local.yml` · канон двух офисов · процедура восстановления `/corp` из архива.

`.doc/README.md` как индекс — **актуален**, все 38 перечисленных файлов существуют ✅.

---

## 11. Что сделано хорошо

Стоит зафиксировать, чтобы не сломать при рефакторинге:

**Безопасность:** zod-валидация на сервере во всех эндпоинтах · honeypot · rate-limit с cleanup и `unref()` · `safeApiError()` не течёт SMTP-деталями в прод · Origin/Referer-проверка · security-заголовки в двух слоях · HSTS с preload · `.env` не в git · осознанный отказ от логирования ПД (152-ФЗ).

**Код:** strict TS без `any`/`@ts-ignore`/non-null · `form-classes.ts` как DRY для форм · `external-reviews.ts` и blog-коллекция как образцы data layer · `escHtml`/`escTelegram` для инъекций в письма и сообщения.

**Производительность:** Astro `<Image>` повсеместно (raw `<img>` — 0) · Hero с `eager` + `fetchpriority="high"` + preload + blur-up · Tourvisor lazy по клику с prefetch на hover · `font-display: swap` везде · локальные шрифты вместо Google CDN · Яндекс.Карты ссылкой, а не iframe · blog на prerender · immutable cache для `/_astro/*`.

**A11y:** skip-link · FAQ-аккордеон с полной ARIA · focus trap в Callback/Gift · глобальный `prefers-reduced-motion` · дубли marquee с `aria-hidden` · `:focus-visible` в формах.

**Процесс:** Dependabot с группировкой по astro/tailwind/fonts · `pnpm-workspace.yaml` с overrides для транзитивных CVE · пять файлов версий Node синхронны · деплой за ручным подтверждением · зеркало на Gitflic · Docker multi-stage + non-root + HEALTHCHECK · осмысленные conventional commits.

---

## 12. План действий по порядку

Приоритет: сначала то, что сломано в production, затем то, что даёт измеримый эффект, затем структурное.

### Этап 0 — Немедленно (P0, 1 день)

Всё в этом этапе либо ломает заявленную функциональность, либо создаёт риск потери данных.

| #   | Задача                                                                                                                                                                                                                 | Файлы                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 0.1 | **Проверить, что prod жив с текущим Caddyfile.** `trusted_proxies cloudflare` требует плагина, отсутствующего в `caddy:2-alpine`. Если сервер работает — значит конфиг на VPS ≠ конфиг в репозитории; синхронизировать | `Caddyfile:5`, `compose.yml:7`     |
| 0.2 | `security.allowedDomains` — восстановить работу rate-limit и получение реального IP                                                                                                                                    | `astro.config.mjs`                 |
| 0.3 | `bodySizeLimit: 64 * 1024` в адаптере + `request_body max_size` в Caddy                                                                                                                                                | `astro.config.mjs:26`, `Caddyfile` |
| 0.4 | Whitelist хостов в `getPublicOrigin()`                                                                                                                                                                                 | `src/lib/site-urls.ts:62-69`       |
| 0.5 | `pnpm optimize:images && pnpm exec astro build` в Dockerfile + поправить лживый комментарий                                                                                                                            | `Dockerfile:14-15`                 |
| 0.6 | `pnpm prune --prod` перед копированием `node_modules` (401 MB → ~5 MB)                                                                                                                                                 | `Dockerfile:23-24`                 |
| 0.7 | Убрать `.doc/`, `AGENTS.md`, `.specify/`, `.ai-factory.json`, `scripts/*` из `.gitignore` и закоммитить                                                                                                                | `.gitignore:26-42`                 |
| 0.8 | CI-job `pnpm check` **до** сборки образа                                                                                                                                                                               | `.github/workflows/deploy.yml`     |
| 0.9 | Ограничить тег `:latest` только ветку `main`                                                                                                                                                                           | `.github/workflows/deploy.yml:5`   |

**Проверка этапа:** задеплоить на staging, залогировать `clientAddress` (должен быть реальный IP клиента, не `172.x`), отправить 6 заявок с одного IP (6-я → 429), отправить 1 заявку с другого IP (должна пройти), убедиться что `dist/` содержит оптимизированные картинки, замерить размер образа.

### Этап 1 — Быстрые победы по метрикам (2–3 дня)

| #    | Задача                                                                                                                    | Ожидаемый эффект                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1.1  | Убрать `opacity: 0` с `<html>`/`<body>`; fade — только на overlay                                                         | LCP −500 мс на холодных заходах                  |
| 1.2  | Заменить Font Awesome на SVG через `astro-iconify`                                                                        | CSS −~200 KB, woff2 −252 KB                      |
| 1.3  | `@fontsource/*/cyrillic-*.css` + `latin-*.css` вместо полных                                                              | woff2 828 KB → ~150 KB                           |
| 1.4  | `encode zstd br gzip` в Caddy                                                                                             | −20 % трафика                                    |
| 1.5  | Убрать `astro-compressor` (при SSR не работает) **либо** отдавать `/_astro/*` через Caddy `file_server { precompressed }` | быстрее сборка / меньше нагрузки на Node         |
| 1.6  | `prerender = true` для `privacy`, `terms`, `404`, `index`                                                                 | закрывает SEO-1 (sitemap) + снимает SSR-нагрузку |
| 1.7  | `ogImageVersion` — build-time вместо `stat()` на запрос                                                                   | −1 файловая операция на каждый ответ             |
| 1.8  | `Cache-Control` для HTML в middleware                                                                                     | предсказуемое кеширование на Cloudflare          |
| 1.9  | Nemo — lazy через `IntersectionObserver` + `preconnect` к `cdn.nemo.travel`                                               | разблокирует первый экран                        |
| 1.10 | Hero `width={1920}` + `sizes`; убрать preload картинок туров; включить `tours/` в `optimize-images`                       | LCP, −500 KB ассетов                             |
| 1.11 | `dumb-init` в Dockerfile; limits + log rotation в compose                                                                 | корректный SIGTERM, защита VPS                   |
| 1.12 | Запинить actions на SHA; buildx-кэш; `provenance`                                                                         | supply-chain + сборка ~40 с                      |
| 1.13 | `noindex` на 404; canonical + prev/next + title для пагинации блога; уникальный description главной                       | SEO-2, SEO-3, SEO-5                              |

**Проверка:** Lighthouse до/после (мобильный профиль), размеры `dist/client/_astro/*.css` и суммы woff2, `curl -I` на HTML и `/_astro/*`.

### Этап 2 — Доступность и доверие (2–3 дня)

| #    | Задача                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------- |
| 2.1  | `src/lib/client/focus-trap.ts` + применить в Reviews-lightbox, форме отзыва, mobile drawer, cookie banner            |
| 2.2  | `role="dialog" aria-modal aria-labelledby` во все overlay (Callback, Gift, Reviews ×2)                               |
| 2.3  | `<div onclick>` → `<button>` в `Reviews.astro:73` и `About.astro:374` (снимает и зависимость CSP от `unsafe-inline`) |
| 2.4  | Контраст: `primary` → `primary-dark` для мелкого текста, `gray-400` → `gray-500/600`, `white/40` → `white/70`        |
| 2.5  | `role="status" aria-live="polite"` на success-блоки; `inputmode="tel"`; `required` + sr-only текст на рейтинг        |
| 2.6  | `role="progressbar"` для ScrollProgress; выяснить с владельцем логику ScrollToTop                                    |
| 2.7  | Иконки 180/192/512 + `site.webmanifest` + `theme-color`                                                              |
| 2.8  | `src/data/company.ts` как единый источник NAP → schema, компоненты, `AGENTS.md`                                      |
| 2.9  | `aggregateRating` из `external-reviews.ts` + `geo` + `openingHoursSpecification` + `WebSite`/`SearchAction`          |
| 2.10 | `/.well-known/security.txt`                                                                                          |

**Проверка:** axe DevTools на главной/блоге/legal, обход всего сайта только с клавиатуры, Rich Results Test, Search Console после деплоя.

### Этап 3 — Архитектурный рефакторинг (1–1,5 недели)

Порядок внутри этапа — по соотношению эффекта к трудозатратам.

| #    | Задача                                                                                                                              | Новые файлы                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 3.1  | **`form-submit.ts`** — устраняет 4 дубля + добавляет `res.ok`, timeout, offline, `siteApi()`                                        | `src/lib/client/form-submit.ts`                                                                      |
| 3.2  | `scroll-lock.ts`, `smooth-scroll.ts`, `scroll-reveal.ts` — вынести из `Layout.astro`                                                | `src/lib/client/*.ts`                                                                                |
| 3.3  | Удалить `TourvisorSearch.astro`; удалить или подключить `ReviewModal.astro`; вычистить мёртвые экспорты и ~10 CSS-классов           | —                                                                                                    |
| 3.4  | `SectionHeading.astro` — 12+ копий разметки                                                                                         | `src/components/ui/SectionHeading.astro`                                                             |
| 3.5  | Data layer: team (23), services (9), faq (7), tours (4), awards (4), partners (10+3), review-docs (8), trust-badges (5), hero-stats | `src/data/*.ts`                                                                                      |
| 3.6  | `env.ts` с zod + `ImportMetaEnv`; слить `env.d.ts` и `window.d.ts`                                                                  | `src/lib/env.ts`                                                                                     |
| 3.7  | Разбить `Reviews.astro` (711)                                                                                                       | `reviews/ReviewsLightbox.astro`, `reviews/ReviewFormOverlay.astro`, `lib/client/reviews-lightbox.ts` |
| 3.8  | Разбить `About.astro` (640)                                                                                                         | `about/AboutHero`, `AboutBenefitsGrid`, `AboutDirections`, `AboutServicesGrid`, `AboutCta`           |
| 3.9  | Разбить `blog/[...page].astro` (590)                                                                                                | `blog/BlogHero`, `BlogFeaturedCard`, `BlogPostCard`, `BlogPagination`                                |
| 3.10 | Разнести `mailer.ts` (295) на транспорт / telegram / rate-limit / шаблон                                                            | `src/lib/*.ts`                                                                                       |
| 3.11 | `partners-marquee.ts` + `social-links.ts` (дубли Partners/OurPartners, Footer/FooterMinimal)                                        | `src/lib/client/`, `src/data/`                                                                       |
| 3.12 | Перевести оставшиеся `is:inline` в bundled-модули (типизация + кеширование)                                                         | —                                                                                                    |
| 3.13 | Токены: `--text-micro/caption`, цвета платформ; нормальная z-шкала вместо `z-2147483649`                                            | `global.css`                                                                                         |
| 3.14 | SMTP `transporter` — синглтон с `pool: true`                                                                                        | `src/lib/mailer.ts`                                                                                  |

`Header.astro` (1233 строки) — план разбиения готов, но требует **явного согласия владельца** (`AGENTS.md`, `.doc/header-frozen.md`).

### Этап 4 — Процессы и качество (параллельно, 2–3 дня)

| #   | Задача                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| 4.1 | `oxlint` (или `eslint-plugin-astro` + `jsx-a11y`) + `pnpm lint` в CI — автоматически ловит `div onclick` и подобное |
| 4.2 | `.prettierrc` + `pnpm format`; `.editorconfig` (сейчас табы и 2 пробела в разных файлах)                            |
| 4.3 | `lefthook` pre-commit: `pnpm check` + format на staged                                                              |
| 4.4 | Playwright smoke: 3 формы, модалки, мобильное меню, 404, блог                                                       |
| 4.5 | Lighthouse CI с бюджетами (LCP, CLS, JS/CSS-веса) в PR                                                              |
| 4.6 | Расширить `spellcheck` с 2 файлов на `src/**/*.{astro,md}`                                                          |
| 4.7 | `environment: production` + health-gate с откатом в deploy                                                          |
| 4.8 | `engines.node` → `>=22.23.0 <23`; токен из URL в mirror-workflow убрать                                             |

### Этап 5 — Документация (1–2 дня, делать по факту завершения этапов)

| #   | Задача                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1 | `AGENTS.md`: Astro 7, пути (`.env.example`, hero, awards, our-partners, corp в архиве), `/404`, недостающие компоненты и зависимости (`@astrojs/sitemap`, `astro-compressor`, `spellcheck`), канон контактов |
| 5.2 | `.specify/memory/constitution.md`: версии → фактические; добавить `security.allowedDomains` как обязательный пункт                                                                                           |
| 5.3 | Единая GitHub-организация во всей деплой-документации (`shkrndns`, не `hyperdevops`): `server-vps-stack-plan.md`, `deploy-prep-checklist.md`, `gitflic-mirror.md`                                            |
| 5.4 | Закрыть устаревшие TODO в `project-roadmap.md`, `audit-full-2026-04.md`, `nemo-flights-widget-plan.md`, `security-baseline-package.md`; обновить размеры в `refactoring-plan.md`                             |
| 5.5 | Убрать `/corp` из активных документов (`Анализ-текста-сайта.md`, `audit-mobile.md`, `testing-plan.md`, `commercial-resource-roadmap.md`)                                                                     |
| 5.6 | Создать `.doc/_archive/`, перенести 5 устаревших документов, объединить пересекающиеся аудиты                                                                                                                |
| 5.7 | Дописать недостающее: Astro 7, middleware/CSP, `src/lib/`, глобальные виджеты Layout, `content.config.ts`, канон двух офисов                                                                                 |
| 5.8 | Обновить `.doc/README.md` под новую структуру                                                                                                                                                                |

### Этап 6 — Отложенное (обсудить приоритет)

| #   | Задача                                           | Комментарий                                                               |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| 6.1 | **Nonce-CSP** вместо `'unsafe-inline'`           | делать после 2.3 и 3.12, когда inline-скриптов почти не останется         |
| 6.2 | Вернуть `cssMinify` с точечным решением для blur | после 1.2/1.3 выигрыш будет уже небольшой; риск регрессии blur остаётся   |
| 6.3 | Hero/tours в AVIF через `<Picture>`              | ещё −30 % веса картинок                                                   |
| 6.4 | Изображения для 6 статей блога + `draft` в схеме | по плану `.doc/max-blog-import-plan.md`                                   |
| 6.5 | Rate-limit в Redis или `caddy-ratelimit`         | когда появится вторая реплика                                             |
| 6.6 | PWA (service worker, offline)                    | `.doc/pwa-plan.md`; иконки и manifest уже в 2.7                           |
| 6.7 | Яндекс.Метрика                                   | чеклист в `.doc/analytics-cookies-plan.md`; CookieBanner и privacy готовы |
| 6.8 | Разбиение `Header.astro`                         | требует согласия владельца                                                |

---

## Порядок работ одной строкой

**Этап 0** (сломано в прод: rate-limit, DoS-векторы, оптимизация картинок, документация вне git) → **Этап 1** (LCP, CSS 363→60 KB, шрифты 828→150 KB, prerender+sitemap) → **Этап 2** (клавиатура, контраст, NAP, rich snippets) → **Этап 3** (дубли форм, data layer, разбиение мега-компонентов) → **Этап 4** (линтер, тесты, бюджеты — чтобы не откатиться) → **Этап 5** (документация по факту) → **Этап 6** (nonce-CSP, AVIF, метрика, PWA).

Ключевой принцип: этапы 0–2 не требуют структурных изменений и не конфликтуют с этапом 3, поэтому их можно катить в прод по одному. Этап 4 стоит завести до этапа 3, чтобы рефакторинг шёл под защитой тестов и линтера.

---

## Журнал выполнения плана

> **Контекст деплоя (2026-09-06):** VPS под новый сайт ещё нет. [anrotrip.ru](https://anrotrip.ru/) отдаёт **старый сайт**. Проверки «prod жив» заменены на подготовку конфигов к первому деплою.

### ✅ 0.1 — Caddyfile готов к `caddy:2-alpine` (2026-09-06)

**Сделано:**

- Удалён `trusted_proxies cloudflare` из site-блока (требует [сторонний модуль](https://caddyserver.com/docs/json/apps/http/trusted_proxies/cloudflare/), не входит в официальный образ).
- Добавлен глобальный блок `{ servers { ... } }` с `trusted_proxies static` — 15 IPv4 + 7 IPv6 диапазонов с [cloudflare.com/ips-v4|v6](https://www.cloudflare.com/ips-v4/).
- Включены `trusted_proxies_strict` и `client_ip_headers CF-Connecting-IP X-Forwarded-For` ([рекомендация Caddy](https://caddyserver.com/docs/caddyfile/options#trusted-proxies) для Cloudflare).

**Проверка:** Docker в среде агента недоступен; синтаксис сверен с документацией Caddy 2.8+. После появления VPS: `docker run --rm -v ./Caddyfile:/etc/caddy/Caddyfile:ro caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile`.

**Файлы:** `Caddyfile`

### ✅ 0.2 — `security.allowedDomains` (Astro 7) (2026-09-06)

**Сделано:**

- В `astro.config.mjs` добавлен `security.allowedDomains`:
  - **production:** `anrotrip.ru`, `www.anrotrip.ru` (https)
  - **dev/preview:** + `localhost`, `127.0.0.1` (http)
- Astro 7 снова доверяет `X-Forwarded-For` за Caddy/Cloudflare → `clientAddress` в API-формах = реальный IP клиента, rate-limit работает per-IP.

**Проверка:** `pnpm check` — 0 errors.

**Файлы:** `astro.config.mjs`

### ✅ 0.3 — `bodySizeLimit` 64 KB (2026-09-06)

**Сделано:**

- `astro.config.mjs`: `adapter: node({ bodySizeLimit: 64 * 1024 })` (было 1 GB по умолчанию).
- `Caddyfile`: `request_body { max_size 64KB }` перед `reverse_proxy`.

**Проверка:** `pnpm check` — 0 errors; `caddy validate` — Valid configuration.

**Файлы:** `astro.config.mjs`, `Caddyfile`

### ✅ 0.4 — Dockerfile: prebuild / optimize:images (2026-09-06)

**Сделано:**

- `Dockerfile` builder: `pnpm exec astro build` → `pnpm build` (запускает `prebuild` → `pnpm optimize:images`).
- Комментарий исправлен: явно указано, почему нельзя `pnpm exec astro build`.

**Проверка:** `docker build -t white_anrotrip:audit-0.4-test .` — успешно (~100 с).

**Файлы:** `Dockerfile`

### ✅ 0.5 — whitelist в `getPublicOrigin()` (2026-09-06)

**Сделано:**

- `src/lib/site-urls.ts`: production принимает только `anrotrip.ru` / `www.anrotrip.ru` из `X-Forwarded-Host` и `Host`.
- Dev (`import.meta.env.PROD === false`): localhost/127.0.0.1 + любой `X-Forwarded-Host` (dev tunnels).
- Протокол: только `http`/`https`, иначе fallback.

**Проверка:** `pnpm check` — 0 errors.

**Файлы:** `src/lib/site-urls.ts`

### ✅ 0.6 — документация в git (вариант A, 2026-09-06)

**Сделано:**

- `.gitignore`: whitelist безопасных `.doc/*` (32 файла); **вне git** — 8 infra/security: `server-vps-stack-plan`, `deploy-prep-checklist`, `perimeter-edge-security`, `security-audit-2026-07`, `security-baseline-package`, `security-hardening-checklist`, `budget-costs`, `vps-plan-justification`.
- `AGENTS.md` — снова отслеживается.
- `scripts/*` — все утилиты (`typograf-blog.mjs`, `skin-tone-transfer.mjs` и др.).
- `.specify/`, `.cursor/`, `.ai-factory.json` — по-прежнему в ignore.

**Коммит не создан** — только подготовка `.gitignore`.

**Файлы:** `.gitignore`

### ✅ 0.7 — `pnpm prune --prod` в Dockerfile (2026-09-06)

**Сделано:**

- Builder после `pnpm build`: `pnpm prune --prod`.
- Runner копирует уже урезанный `node_modules`.

**Замеры:**

- `node_modules` в образе: **328 MB → 259 MB** (−21%)
- Размер образа: **671 MB → 588 MB** (−83 MB)

**Проверка:** `docker build -t white_anrotrip:audit-0.7-test .` — успешно.

**Файлы:** `Dockerfile`

### ✅ 0.8 — CI: `pnpm check` перед сборкой образа (2026-09-06)

**Сделано:**

- Job `check` в `.github/workflows/deploy.yml`: checkout → pnpm 11.3 → Node 22 → `pnpm install --frozen-lockfile` → `pnpm check`.
- `build-push` зависит от `check` (`needs: check`).

**Файлы:** `.github/workflows/deploy.yml`

### ✅ 0.9 — CI только `main`, ветка `main-design-green` удалена (2026-09-06)

**Сделано:**

- `.github/workflows/deploy.yml`: триггер push только `main` (убран `main-design-green`).
- Удалена устаревшая ветка на GitHub: `git push origin --delete main-design-green` (была на 64 коммита позади `main`).

**Файлы:** `.github/workflows/deploy.yml`

### ✅ 0.10 — очистка dependabot-веток на GitHub (2026-09-06)

**Сделано:**

- Удалены 12 устаревших `origin/dependabot/*` (на 46–136 коммитов позади `main`).
- На remote остался только `origin/main`.
- `.github/dependabot.yml` сохранён — свежие PR создаст в понедельник.

### ✅ 1.1 — убран page fade на `<html>`/`<body>` (2026-09-06)

**Сделано:**

- Удалён inline-скрипт fade-in в `Layout.astro` (`opacity: 0` на `<html>`/`<body>` скрывал контент до DOMContentLoaded → регресс LCP).
- Fade на overlay (модалки, drawer, logo-click в Header) не тронут.

**Ожидаемый эффект:** LCP −~500 мс на холодных заходах.

**Файлы:** `src/layouts/Layout.astro`

### ✅ 1.2 — Font Awesome → SVG (astro-iconify) (2026-09-06)

**Сделано:**

- `FaIcon.astro` + `src/lib/fa-icons.ts` — обёртка Iconify (`fa6-solid:*`, `fa6-regular:*`).
- Мигрированы ~15 компонентов, `mobile-nav-icons.ts`, `PhoneOutlineIcon.astro`.
- Markdown: `rehype-fa-icons.mjs` — `<i class="fa-solid …">` → inline SVG при сборке.
- **Доп. фикс (иконки в HTML-блоках блога):** Astro запускает кастомные rehype-плагины до `rehype-raw`; HTML из `.md` лежит в узлах `raw` — плагин дополнен обработкой `raw` (статья `top-destinations-2026`).
- JS: клон `<template>` для звёзд в модалке отзывов; bottom sheet услуг — clone SVG с карточки.
- Удалены `@fortawesome/fontawesome-free` и 4 `@import` из `global.css`.

**Проверка:** `pnpm check` — 0 errors; `pnpm build` — vite OK (prerender падает на typograf `patch.json`, не связано с иконками).

**Файлы:** `FaIcon.astro`, `fa-icons.ts`, `rehype-fa-icons.mjs`, `mobile-nav-icons.ts`, `global.css`, `package.json`, 15+ компонентов.

### ✅ 1.3 — subset шрифтов cyrillic + latin (2026-09-06)

**Сделано:**

- `global.css`: вместо полных `@fontsource/inter/{400,500,600}.css` и `montserrat/{600,700,800}.css` — только `cyrillic-*` + `latin-*` для каждого начертания.
- Убраны greek, vietnamese, latin-ext, cyrillic-ext из бандла (не нужны для RU-сайта).

**Замер woff2 в node_modules (только используемые начертания):**

- Inter 400/500/600: **312 KB → 96 KB** (−69%)
- Montserrat 600/700/800: **264 KB → 96 KB** (−64%)
- **Итого: ~576 KB → ~192 KB**

**Файлы:** `src/styles/global.css`

### ✅ 1.4 — `encode zstd gzip` в Caddy (2026-09-06)

**Сделано:**

- `Caddyfile`: `encode gzip` → `encode zstd gzip` — Caddy отдаёт zstd клиентам с поддержкой, иначе gzip (HTML/CSS/JS ≈ −15–20 % к одному gzip).
- **Brotli (`br`)** в официальном `caddy:2-alpine` **нет** (`http.encoders.br` не зарегистрирован; только `gzip` + `zstd`). Для `br` нужен xcaddy-сборка — отложено.

**Проверка:** `caddy validate` — Valid configuration (`caddy:2-alpine`).

**Файлы:** `Caddyfile`

### ✅ 1.5 — убран `astro-compressor` (2026-09-06)

**Сделано:**

- Удалены `astro-compressor` из `package.json` и `compressor()` из `astro.config.mjs`.
- При SSR + `reverse_proxy` предсжатые `.br/.gz` в `dist/client/` не отдавались; сжатие делает Caddy (`encode zstd gzip` из 1.4).
- Сборка короче (нет post-build pass по 34+ файлам).

**Альтернатива на будущее:** отдавать `/_astro/*` через Caddy `file_server { precompressed }` + volume с `dist/client` — снимет нагрузку с Node; отложено.

**Проверка:** `pnpm check` — 0 errors.

**Файлы:** `astro.config.mjs`, `package.json`, `pnpm-lock.yaml`

### ⏸ 1.6 — prerender для index / privacy / terms / 404 (отложено)

**Проблема:** `pnpm build` падал на prerender: Tailwind v4 + `css-tree` в prerender-chunk.

**Временный обход (2026-09-06):** блог переведён на SSR — маршруты `blog/index.astro`, `blog/page/[page].astro`, `blog/[slug].astro` + `src/lib/blog-list.ts`. `pnpm build` — **Complete**.

**Дополнительно:**

- Редирект 301: `/blog/N` → `/blog/page/N` (legacy astro paginate) в `middleware.ts`.
- SEO-2: canonical = текущая страница, `title` с номером, `rel="prev/next"` в `BlogListPage.astro`.
- URL пагинации: `/blog/page/2` (было `/blog/2`).

**Следующий шаг (1–2 дня):** vite-плагин для css-tree или апстрим-фикс → вернуть prerender блога и включить 1.6 для `index`, `privacy`, `terms`, `404`.

**Файлы:** `blog/index.astro`, `blog/page/[page].astro`, `blog/[slug].astro`, `blog-list.ts`, `BlogListPage.astro`, `middleware.ts` (удалены `[...page].astro`, `[...slug].astro`)

### ✅ 1.8 — Cache-Control для HTML в middleware (2026-09-06)

**Сделано:**

- HTML 200: `public, max-age=0, s-maxage=300, stale-while-revalidate=600` (CDN кеш, браузер revalidate).
- `/api/*`: `no-store`.
- HTML 404: `no-cache`.
- `/_astro/*` и og-image — без изменений (Caddy / существующие правила).

**Файлы:** `src/middleware.ts`

### ✅ 1.9 — Nemo lazy + preconnect (2026-09-06)

**Сделано:**

- Убраны render-blocking `<link rel="stylesheet">` и `<script defer>` из `NemoSearch.astro`.
- Ассеты Nemo (CSS виджета, тема, JS) подгружаются через `IntersectionObserver` на `#search-widget` (`rootMargin: 200px`) — паттерн как у Tourvisor.
- `preconnect` + `dns-prefetch` к `cdn.nemo.travel` в `index.astro` (раньше был только Tourvisor).

**Ожидаемый эффект:** CSS/JS Nemo вне критического пути первого экрана; раннее TCP/TLS к CDN при загрузке главной.

**Файлы:** `NemoSearch.astro`, `index.astro`, `window.d.ts`

### ✅ 1.10 — Hero LCP + приоритет загрузки (2026-09-06)

**Сделано:**

- `Hero.astro`: `width={1920}` `height={1080}` `sizes="100vw"` — не отдаём 4K-декодирование на мобильном.
- `index.astro`: preload только Hero (1920px); убраны preload туров (ниже первого экрана, конкурировали с LCP; к тому же maldives/seychelles не использовались в сетке).
- `PopularTours.astro`: все карточки `loading="lazy"` + `fetchpriority="low"` (секция ниже fold).
- `JournalSection.astro`: все превью lazy + `sizes` для responsive srcset.

**Отложено (по решению заказчика):**

- `tours/` в `optimize-images` — ассеты «Актуальные предложения» будут полностью заменены; прогон sharp на текущих файлах не имеет смысла. После замены — убрать `/tours/` из `SKIP_PATTERNS` и прогнать `pnpm optimize:images`.
- Тонкая настройка блога (AVIF, cardImage) — секция «Наш блог» будет меняться; `sizes` уже заложены под будущие ассеты.

**Файлы:** `Hero.astro`, `index.astro`, `PopularTours.astro`, `JournalSection.astro`, `optimize-images.mjs`

### ✅ 1.11 — dumb-init + limits + log rotation (2026-09-06)

**Сделано:**

- `Dockerfile`: `dumb-init` как `ENTRYPOINT` — `SIGTERM`/`SIGINT` корректно доходят до Node (без 10 с таймаута при `docker stop`). Заодно `wget` для `HEALTHCHECK`.
- `compose.yml`: `mem_limit`/`cpus` (app 512m/1 CPU, caddy 128m/0.25 CPU), ротация логов `json-file` 10m×3, `security_opt: no-new-privileges` на оба сервиса.
- `compose.local.yml`: `restart`, logging, `security_opt` — паритет с prod (без mem limits — локальная разработка).

**Отложено:** `read_only: true` + `tmpfs` для app — Astro 7 пишет file-sessions; нужен отдельный writable volume.

**Файлы:** `Dockerfile`, `compose.yml`, `compose.local.yml`

### ✅ 1.12 — CI: SHA-pin, buildx-кэш, provenance (2026-09-06)

**Сделано:**

- `deploy.yml`: все actions запинены на полный commit SHA (с комментарием версии).
- `docker/setup-buildx-action` + `docker/build-push-action` вместо `docker build`/`push --all-tags`.
- GHA cache: `cache-from/to: type=gha,mode=max` — повторные сборки быстрее.
- `provenance: true`, `sbom: true` + permissions `attestations: write`, `id-token: write`.
- `concurrency: deploy-${{ github.ref }}` с `cancel-in-progress`.
- Явные теги `:latest` и `:sha-${{ github.sha }}` (без `--all-tags`).
- `mirror-gitflic.yml`: checkout тоже на SHA.

**Файлы:** `.github/workflows/deploy.yml`, `.github/workflows/mirror-gitflic.yml`

### ✅ 1.13 — SEO: 404 noindex, description главной (2026-09-06)

**Сделано:**

- `Layout.astro`: prop `robots` (дефолт `max-image-preview:large`).
- `404.astro`: `robots="noindex, follow"`, `showSchema={false}` — soft-404 не попадает в индекс.
- `index.astro`: уникальный description ~130 символов (услуги + Екатеринбург + УТП).
- **SEO-2 (пагинация блога):** уже в 1.6 — canonical/title/prev/next в `BlogListPage.astro`.

**Файлы:** `Layout.astro`, `404.astro`, `index.astro`

### ✅ 1.7 — `ogImageVersion` на этапе сборки (2026-09-06)

**Сделано:**

- Убран `stat()` из `Layout.astro` на каждый SSR-запрос.
- `astro.config.mjs`: `vite.define` → `import.meta.env.OG_IMAGE_VERSION` (mtime `public/og-image.png|jpg` после prebuild).
- Тип в `src/env.d.ts`.

**Проверка:** `pnpm check` — 0 errors.

**Файлы:** `Layout.astro`, `astro.config.mjs`, `env.d.ts`

### ✅ 2.1 — focus-trap.ts (2026-09-06)

**Сделано:** `src/lib/client/focus-trap.ts`; подключено в CallbackModal, GiftModal, Reviews (lightbox + форма), Header drawer, CookieBanner.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.2 — role="dialog" aria-modal aria-labelledby (2026-09-06)

**Сделано:** CallbackModal, GiftModal, Reviews lightbox и форма отзыва.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.3 — div onclick → button (2026-09-06)

**Сделано:** Reviews.astro (карточки отзывов), About.astro (карточки услуг → `<button type="button">`).

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.4 — контраст WCAG AA (2026-09-06)

**Сделано:** `text-primary-dark` для мелкого текста (Hero stats, section-badge); `gray-400` → `gray-500/600`; `white/40` → `white/70` (Reviews, ExternalReviewsRow); ссылки согласия в модалках — `primary-dark`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.5 — aria-live, inputmode tel, rating required (2026-09-06)

**Сделано:** `role="status" aria-live="polite"` на success-блоки (Callback, Gift, Reviews); `inputmode="tel"` на телефонах (Callback, Gift, Reviews, cabinet); `required` + sr-only «N из 5» на звёзды ReviewModal.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.6 — ScrollProgress + ScrollToTop (2026-09-06)

**Сделано:** ScrollProgress — `role="progressbar"`, `aria-valuenow/min/max`; ScrollToTop — **оставлена исходная логика** (кнопка у низа страницы, `docHeight - scrollPos < 50`).

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.7 — PWA icons + manifest (2026-09-06)

**Сделано:** `public/apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`; `public/site.webmanifest`; `Layout.astro` — manifest + apple-touch-icon 180; `theme-color` уже был.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.8 — src/data/company.ts NAP (2026-09-06)

**Сделано:** единый источник телефонов, email, соцсетей, офисов; подключено в Layout schema, Contacts, Footer, Hero, Header (tel), OfficeWidget, FAQ, terms; AGENTS.md обновлён.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.9 — aggregateRating, geo, WebSite schema (2026-09-06)

**Сделано:** `aggregateRating` (Яндекс + 2ГИС из `external-reviews.ts`); `geo` на TravelAgency и LocalBusiness Челябинск; `WebSite` + `SearchAction` → `#search-widget`; openingHours из `company.ts`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 2.10 — security.txt (2026-09-06)

**Сделано:** `public/.well-known/security.txt` (Contact, Expires, Canonical, Policy).

**Проверка:** `pnpm check` — 0 errors.

---

## Этап 3 — Архитектурный рефакторинг (2026-09-06)

### ✅ 3.1 — form-submit.ts

**Сделано:** `src/lib/client/form-submit.ts`; миграция CallbackModal, GiftModal, Reviews.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.2 — scroll-lock, smooth-scroll, scroll-reveal

**Сделано:** вынесены из `Layout.astro` в `src/lib/client/*.ts`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.3 — мёртвый код

**Сделано:** удалены TourvisorSearch, ReviewModal; неиспользуемые CSS/typograf.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.4 — SectionHeading.astro

**Сделано:** `src/components/ui/SectionHeading.astro`; 12+ секций мигрированы.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.5 — data layer

**Сделано:** `src/data/*.ts` (team, services, faq, tours, awards, partners, review-docs, trust-badges, hero-stats).

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.6 — env.ts + типы

**Сделано:** `src/lib/env.ts` (zod SMTP/Telegram); `src/env.d.ts` объединён с Window; удалён `window.d.ts`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.7 — Reviews.astro

**Сделано:** `reviews/ReviewsLightbox.astro`, `reviews/ReviewFormOverlay.astro`, `lib/client/reviews-lightbox.ts`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.8 — About.astro

**Сделано:** `about/AboutHero`, `AboutBenefitsGrid`, `AboutDirections`, `AboutServicesGrid`, `AboutCta`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.9 — blog-компоненты

**Сделано:** `BlogHero`, `BlogFeaturedCard`, `BlogPostCard`, `BlogPagination`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.10 — mailer.ts

**Сделано:** `mail-transport`, `mail-telegram`, `mail-templates`, `rate-limit`, `mail-types`; `mailer.ts` — re-export.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.11 — partners-marquee + social-links

**Сделано:** `lib/client/partners-marquee.ts`; `data/social-links.ts` + `ui/SocialLinkIcon.astro`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.12 — is:inline → bundled

**Сделано:** FAQ, Team, ScrollToTop, SearchWidget, NemoSearch, Modal, Layout navigation, index anchor; JSON-LD оставлен inline.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.13 — токены + z-шкала

**Сделано:** `--font-size-micro/caption`, `--color-platform-*`, `z-modal-controls`, `z-overlay-top`, `text-micro/caption`; убран `z-2147483649`.

**Проверка:** `pnpm check` — 0 errors.

### ✅ 3.14 — SMTP pool singleton

**Сделано:** `mail-transport.ts` — синглтон transporter с `pool: true`.

**Проверка:** `pnpm check` — 0 errors.

---

## Этап 4 — Процессы и качество (2026-09-07)

### ✅ 4.1 — oxlint + eslint + CI

**Сделано:**

- `oxlint` (TS/JS) + `eslint` + `eslint-plugin-astro` + `jsx-a11y` — `pnpm lint`.
- `eslint.config.js`, `.oxlintrc.json`.
- CI: `.github/workflows/ci.yml` (quality job) + lint в `deploy.yml` check.
- Исправлены a11y/линт-нарушения: `GiftSection` (div→button), `FavoritesWidget` (a→button), ternary в `Header`, пустые h3 с sr-only.

**Проверка:** `pnpm lint` — 0 errors; `pnpm check` — 0 errors.

### ✅ 4.2 — Prettier + EditorConfig

**Сделано:** `.prettierrc`, `.prettierignore`, `.editorconfig`; `pnpm format` / `format:check` (ts/js/json/yml/css/md — `.astro` с `.map()`+HTML-комментариями пока вне check из-за ограничения prettier-plugin-astro).

**Проверка:** `pnpm format:check` — OK.

### ✅ 4.3 — lefthook pre-commit

**Сделано:** `lefthook.yml` — `pnpm check` + prettier на staged; `prepare` → `lefthook install`; `allowBuilds: lefthook: true` в `pnpm-workspace.yaml`.

### ✅ 4.4 — Playwright smoke

**Сделано:** `playwright.config.ts`, `e2e/smoke.spec.ts` (главная, 3 модалки, 404, блог), `e2e/mobile-menu.spec.ts` (drawer).

**Проверка:** 7/7 passed (chromium + mobile-chrome).

### ✅ 4.5 — Lighthouse CI

**Сделано:** `lighthouserc.cjs` с бюджетами LCP/CLS/JS/CSS; job `lighthouse` в CI (только PR).

### ✅ 4.6 — spellcheck

**Сделано:** scope `src/**/*.astro` + `src/**/*.md`; `@cspell/dict-ru_ru`; project words; exclude `terms`/`privacy`.

**Проверка:** `pnpm spellcheck` — 0 issues.

### ✅ 4.7 — deploy health-gate

**Сделано:** `compose.yml` — `environment: NODE_ENV=production`, explicit `healthcheck`; `deploy.yml` — ожидание healthy + rollback при провале.

### ✅ 4.8 — engines.node + mirror token

**Сделано:** `engines.node` → `>=22.23.0 <23`; Gitflic mirror — credential helper вместо токена в URL workflow-файла.

**Проверка:** `pnpm check` — 0 errors.

---

## Этап 5 — Документация (2026-09-07)

### ✅ 5.1 — AGENTS.md

**Сделано:** Astro 7, data layer, client modules, lint/e2e/spellcheck, NAP, corp в архиве.

### ✅ 5.2 — constitution.md

**Сделано:** актуальные версии; `security.allowedDomains` обязателен.

### ✅ 5.3 — GitHub org

**Сделано:** `shkrndns` в deploy-доках.

### ✅ 5.4–5.5 — TODO и /corp

**Сделано:** roadmap, nemo, security-baseline, refactoring; corp убран из активных доков.

### ✅ 5.6 — `_archive/`

**Сделано:** 5 устаревших файлов перенесены.

### ✅ 5.7 — architecture-reference.md

**Сделано:** middleware, lib, widgets, content, офисы.

### ✅ 5.8 — README.md

**Сделано:** обновлён указатель.

**Проверка:** `pnpm check` — 0 errors.
