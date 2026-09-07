# Подготовка к деплою: чеклист, сроки, роли

> **Статус:** ДЕЙСТВУЮЩИЙ ДОКУМЕНТ  
> **Актуально на:** июль 2026  
> **Связанные документы:** [server-vps-stack-plan.md](./server-vps-stack-plan.md), [testing-plan.md](../testing/testing-plan.md), [project-roadmap.md](../roadmaps/project-roadmap.md)

Краткий ориентир: что подготовить заранее, сколько времени закладывать и что может сделать ИИ-агент, а что — только владелец проекта.

---

## Оценка сроков

| Режим | Активная работа | Календарно | Комментарий |
|---|---|---|---|
| **Аварийный** | ~2 ч | 2–4 ч | Минимум security, без полного smoke-теста, DNS «как получится» |
| **VPS уже подготовлен** | ~30 мин | до 1 ч | `docker compose pull/up`, HTTPS, быстрые проверки |
| **С нуля, торопясь** | 3–4 ч | 4–6 ч | Рабочий сайт, security и формы — потом |
| **С нуля, нормальный темп** | 6–9 ч | **1–2 дня** | UFW/SSH/fail2ban, все страницы и формы, DNS с запасом |

**Нормальный темп (рекомендуется для первого прода):**

- **День 1 (3–4 ч):** VPS, Docker, security baseline, `.env`, первый деплой, smoke-тест страниц по IP.
- **День 2 (3–4 ч):** тест форм (SMTP + Telegram), переключение DNS, HTTPS, мобилка, финальный чеклист.

DNS propagation — от 15 минут до нескольких часов, иногда до суток. Это ожидание, не активная работа.

---

## Кто что делает

### ИИ-агент может сделать сам (~70%)

- `pnpm check`, `pnpm build`, исправление ошибок сборки
- Подготовка и правка `compose.yml`, `Caddyfile`, скриптов для VPS
- Команды для UFW, Docker, deploy-пользователя, fail2ban
- Коммиты, push, помощь с CI/CD workflow
- Локальный preview и smoke-тест
- Пошаговое ведение деплоя и правки по ходу
- Шаблон `.env` (без секретов)

### ИИ-агент + доступ от владельца (~20%)

| Задача | Что нужно передать |
|---|---|
| Настройка VPS по SSH | IP сервера + SSH-ключ или пароль `deploy` |
| Запуск Docker на сервере | То же |
| Деплой через GitHub Actions | `SSH_HOST`, `SSH_PRIVATE_KEY` в GitHub Secrets |
| `.env` на VPS | `SMTP_PASS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| DNS через API | Токен Cloudflare / REG.RU (если есть API) |
| Триггер workflow | `gh auth login` один раз или ручной Run workflow |

При SSH-доступе и секретах агент может провести **80–90%** технической части деплоя.

### Только владелец проекта (~10%)

| Задача | Почему агент не может |
|---|---|
| Заказ и оплата Beget VPS | Личный кабинет, оплата |
| Первый вход на VPS | Пароль из письма Beget |
| Создание Telegram-бота | @BotFather, личный Telegram |
| Пароль SMTP Яндекс 360 | `online@anrotrip.ru` |
| Переключение DNS (REG.RU / Cloudflare) | Логин регистратора, часто 2FA |
| GitHub Secrets | UI GitHub или токен с правами |
| Добавление SSH-ключа в GitHub | Подтверждение в аккаунте |
| Решение «когда уходить с Tilda» | Бизнес-решение |
| Финальная проверка в браузере | Убедиться, что письмо/Telegram реально пришли |

---

## Минимум от владельца перед стартом (~15–20 мин)

Подготовьте **до** сессии деплоя — так агент сразу переходит к настройке, без пауз на ожидание доступов.

### 1. VPS (Beget)

- [ ] VPS заказан (рекомендуется: 2 ядра / 4 ГБ RAM — см. [vps-plan-justification.md](./vps-plan-justification.md))
- [ ] Есть **внешний IP** сервера
- [ ] Первый вход выполнен (root или временный пароль из письма)
- [ ] SSH-ключ для `deploy` готов (или согласовано, что агент сгенерирует и вы добавите публичный ключ)

### 2. Секреты для форм

Скопируйте в безопасное место (не в git!) — по шаблону [`.env.example`](../../.env.example) и [forms.md](../forms/forms.md):

- [ ] `SMTP_PASS` — пароль ящика `online@anrotrip.ru` (Яндекс 360)
- [ ] `TELEGRAM_BOT_TOKEN` — токен от @BotFather
- [ ] `TELEGRAM_CHAT_ID` — id чата (через `getUpdates` после сообщения боту)

Остальные SMTP-поля уже известны:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=online@anrotrip.ru
MAIL_TO=online@anrotrip.ru
MAIL_FROM=online@anrotrip.ru
```

### 3. GitHub

- [ ] Репозиторий: `shkrndns/white_anrotrip`
- [ ] SSH-ключ для push с рабочей машины добавлен в GitHub
- [ ] В **Settings → Secrets and variables → Actions**:
  - [ ] `SSH_HOST` — IP Beget VPS
  - [ ] `SSH_PRIVATE_KEY` — приватный ключ пользователя `deploy` на VPS

### 4. DNS (можно отложить на День 2)

- [ ] Доступ к REG.RU (или Cloudflare), домен `anrotrip.ru`
- [ ] Записи для переключения (когда сайт уже работает по IP):

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | IP Beget VPS |
| A | `www` | IP Beget VPS |

Опционально: сначала `test.anrotrip.ru` → тот же IP — см. [perimeter-edge-security.md](./perimeter-edge-security.md).

### 5. Решения «на берегу»

- [ ] Дата/время переключения с Tilda (если ещё на Tilda)
- [ ] Кто принимает тестовые заявки с форм (email + Telegram)

---

## Чеклист деплоя (нормальный темп)

### День 1 — сервер и первый запуск

- [ ] Обновление ОС, пользователь `deploy`, SSH по ключу
- [ ] Docker + Docker Compose
- [ ] UFW: 22 (или 2222), 80, 443/tcp, 443/udp
- [ ] SSH hardening + fail2ban — см. [security-hardening-checklist.md](../security/security-hardening-checklist.md)
- [ ] На VPS: `/home/deploy/anrotrip/` → `compose.yml`, `Caddyfile`, `.env`
- [ ] `pnpm check` и `pnpm build` локально (или образ из GHCR после push в `main`)
- [ ] GitHub Actions: build-push прошёл зелёным
- [ ] Deploy workflow: **Actions → Deploy to VPS → Run workflow → deploy: true**
- [ ] Сайт открывается по IP или временному домену
- [ ] Smoke-тест страниц — см. [testing-plan.md](../testing/testing-plan.md)

### День 2 — формы, DNS, прод

- [ ] Тест `POST /api/callback`, `/api/gift`, `/api/review` — письмо и Telegram
- [ ] DNS A-записи на IP VPS
- [ ] HTTPS (Caddy + Let's Encrypt) на `anrotrip.ru` и `www`
- [ ] Редирект HTTP → HTTPS
- [ ] Мобильный хедер, якоря, виджеты Nemo/Tourvisor
- [ ] `backdrop-blur` на production (не белые блоки)
- [ ] Финальный чеклист из [testing-plan.md](../testing/testing-plan.md)

---

## Быстрые команды

### Локально перед деплоем

```bash
pnpm check
pnpm build
```

### На VPS (аварийное обновление, если всё уже настроено)

```bash
cd /home/deploy/anrotrip
IMAGE_TAG=latest GITHUB_REPOSITORY=shkrndns/white_anrotrip docker compose pull app
IMAGE_TAG=latest GITHUB_REPOSITORY=shkrndns/white_anrotrip docker compose up -d
docker image prune -f
```

### CI/CD

1. Push в `main` → автоматическая сборка образа в GHCR
2. **Actions → Deploy to VPS → Run workflow → deploy: true**

Подробнее: [server-vps-stack-plan.md](./server-vps-stack-plan.md)

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [server-vps-stack-plan.md](./server-vps-stack-plan.md) | Архитектура, Docker, Caddy, CI/CD |
| [security-hardening-checklist.md](../security/security-hardening-checklist.md) | UFW, SSH, fail2ban, заголовки Caddy |
| [perimeter-edge-security.md](./perimeter-edge-security.md) | DNS, Cloudflare, миграция с Tilda |
| [forms.md](../forms/forms.md) | Формы, `.env`, SMTP, Telegram |
| [testing-plan.md](../testing/testing-plan.md) | Smoke-тесты и E2E |
| [project-roadmap.md](../roadmaps/project-roadmap.md) | Фаза 2: деплой на Beget VPS |
| [budget-costs.md](./budget-costs.md) | Смета и оценка трудозатрат |
