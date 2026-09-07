# Канон прода: Beget VPS + Docker + Caddy + Astro SSR

> **Статус:** ДЕЙСТВУЮЩИЙ ПЛАН  
> **Хостинг:** Beget VPS  
> **Домен:** anrotrip.ru

---

## Архитектура стека

```
Интернет
  │
  ▼
Cloudflare (DNS + DDoS-Guard, опционально)
  │
  ▼
Beget VPS (Ubuntu)
  │
  ▼
Docker Compose
  ├── caddy:2-alpine  (порты 80, 443, 443/udp HTTP/3)
  │      └── reverse_proxy → app:4321
  └── app (ghcr.io/shkrndns/white_anrotrip:latest)
         └── Node.js 22 (Astro SSR standalone)
               └── PORT 4321
```

---

## Docker: многоступенчатая сборка

**Dockerfile** (3 стейджа):

| Стейдж | База | Назначение |
|---|---|---|
| `deps` | node:22.14-alpine | Установка зависимостей через pnpm |
| `builder` | node:22.14-alpine | `pnpm optimize:images && astro build` |
| `runner` | node:22.14-alpine | Production: только `dist/` + `node_modules` |

- Пользователь: `astro` (UID 1001, non-root)
- HEALTHCHECK: `wget http://localhost:4321/` каждые 30 сек
- Команда запуска: `node ./dist/server/entry.mjs`
- ENV в контейнере: `HOST=0.0.0.0 PORT=4321 NODE_ENV=production`

---

## Docker Compose (production)

Файл: `compose.yml`

```yaml
services:
  caddy:    # порты 80/443/443udp, зависит от app (healthcheck)
  app:      # ghcr.io/shkrndns/white_anrotrip:{IMAGE_TAG}
             # env_file: .env (SMTP, Telegram, etc.)
volumes:
  caddy_data:    # Let's Encrypt сертификаты
  caddy_config:  # Caddy конфиг
```

Переменные при деплое:
- `IMAGE_TAG=sha-{github.sha}` — конкретный образ
- `GITHUB_REPOSITORY=shkrndns/white_anrotrip`

---

## Caddyfile

```caddyfile
anrotrip.ru, www.anrotrip.ru {
    encode zstd gzip
    request_body { max_size 64KB }
    reverse_proxy app:4321
}
```

- HTTPS — автоматически через Let's Encrypt
- HTTP/3 (QUIC) — порт 443/udp
- `trusted_proxies static` (Cloudflare) — в глобальном блоке `{ servers { ... } }` — см. актуальный `Caddyfile` в репо

---

## GitHub Actions: CI/CD

Файл: `.github/workflows/deploy.yml`

### Шаг 1: Build + Push (автоматически при каждом push в main)

```
push → main
  └── build-push job:
        1. Checkout
        2. Login GHCR
        3. docker build → ghcr.io/shkrndns/white_anrotrip:sha-{SHA}
                        ghcr.io/shkrndns/white_anrotrip:latest
        4. docker push --all-tags
```

### Шаг 2: Deploy (только вручную)

```
Actions → Deploy to VPS → Run workflow → deploy: true
  └── deploy job (needs: build-push):
        SSH → Beget VPS → /home/deploy/anrotrip/
          docker compose pull app
          docker compose up -d
          docker image prune -f
```

**Обязательные GitHub Secrets:**

| Secret | Значение |
|---|---|
| `SSH_HOST` | IP Beget VPS |
| `SSH_PRIVATE_KEY` | Приватный SSH-ключ деплой-пользователя |

---

## VPS: структура директорий

```
/home/deploy/
└── anrotrip/
    ├── compose.yml      # production compose
    ├── Caddyfile        # конфиг Caddy
    └── .env             # переменные окружения (SMTP, Telegram, etc.)
```

**Пользователь:** `deploy` (отдельный, с ограниченными правами)

---

## Переменные окружения (.env на VPS)

Из `.env.example`:

```env
# SMTP (Яндекс 360)
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=online@anrotrip.ru
SMTP_PASS=<пароль>
MAIL_TO=online@anrotrip.ru
MAIL_FROM=online@anrotrip.ru

# Telegram Bot
TELEGRAM_BOT_TOKEN=<токен бота>
TELEGRAM_CHAT_ID=<chat_id>
```

---

## Docker реестр: GHCR

- Реестр: `ghcr.io`
- Образ: `ghcr.io/hyperdevops/white_anrotrip`
- Теги: `latest`, `sha-{commit_sha}`
- Авторизация: `GITHUB_TOKEN` (автоматически в Actions)

---

## Деплой вручную (аварийный)

```bash
# На VPS
cd /home/deploy/anrotrip

# Обновить образ
IMAGE_TAG=latest GITHUB_REPOSITORY=hyperdevops/white_anrotrip \
  docker compose pull app

# Перезапустить
IMAGE_TAG=latest GITHUB_REPOSITORY=hyperdevops/white_anrotrip \
  docker compose up -d

# Очистить старые образы
docker image prune -f
```

---

## Локальный тест production-сборки

Файл: `compose.local.yml`

```bash
docker compose -f compose.local.yml up
# Открыть http://localhost:4321
```

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [deploy-prep-checklist.md](./deploy-prep-checklist.md) | Сроки, подготовка заранее, роли агент/владелец, чеклист деплоя |
| [gitflic-mirror.md](./gitflic-mirror.md) | Зеркало на Gitflic (резервный remote) |
| [perimeter-edge-security.md](./perimeter-edge-security.md) | Фаервол, SSH, Cloudflare, DNS |
| [budget-costs.md](./budget-costs.md) | Смета: VPS, домен |
| [vps-plan-justification.md](./vps-plan-justification.md) | Обоснование тарифа Beget |
