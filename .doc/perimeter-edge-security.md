# Периметр безопасности: фаервол, SSH, Cloudflare, DNS

> **Статус:** Запланировано (Фаза 3)  
> Выполнять на этапе настройки Beget VPS.

---

## UFW (фаервол)

```bash
# Разрешить только нужные порты
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh        # 22 (потом заменить на кастомный порт)
ufw allow 80/tcp     # HTTP (Caddy → редирект на HTTPS)
ufw allow 443/tcp    # HTTPS
ufw allow 443/udp    # HTTP/3 / QUIC
ufw enable
ufw status verbose
```

---

## SSH Hardening

Файл: `/etc/ssh/sshd_config`

```
# Менять порт с 22 на нестандартный (например 2222)
Port 2222

# Только ключи — запретить пароли
PasswordAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes

# Запретить root login
PermitRootLogin no

# Ограничить попытки
MaxAuthTries 3
LoginGraceTime 30

# Только нужные пользователи
AllowUsers deploy
```

После изменения порта — обновить UFW:
```bash
ufw allow 2222/tcp
ufw deny 22/tcp
```

---

## fail2ban

```bash
apt install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 2222
maxretry = 5
bantime = 1h
findtime = 10m

[caddy-auth]
# При необходимости — блокировать по количеству 4xx от одного IP
```

---

## Cloudflare / DDoS-Guard

Опционально, но рекомендуется:

1. Перенести DNS на Cloudflare (или DDoS-Guard для RU)
2. Включить проксирование (оранжевое облако)
3. В Caddyfile уже прописано: `trusted_proxies cloudflare`
4. Cloudflare → Security → Bot Fight Mode: On

---

## DNS (REG.RU)

Записи для anrotrip.ru:

| Тип | Имя | Значение |
|---|---|---|
| A | @ | IP Beget VPS |
| A | www | IP Beget VPS |
| A | ticket | IP VPS или CNAME Nemo |
| MX | @ | Яндекс (mail.yandex.net) |

При использовании Cloudflare — A-записи ставятся в Cloudflare, там же управляется кэш и DDoS-защита.

---

## Чек-лист миграции с Tilda

- [ ] Экспортировать контент с Tilda (тексты, изображения)
- [ ] Запустить сайт на временном домене (test.anrotrip.ru)
- [ ] Провести полный smoke-test
- [ ] Перенести DNS
- [ ] Убедиться в работе HTTPS (Caddy + Let's Encrypt)
- [ ] Удалить сайт с Tilda (или оставить как резерв на 30 дней)

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [server-vps-stack-plan.md](./server-vps-stack-plan.md) | Docker, Caddy, CI/CD |
| [security-baseline-package.md](./security-baseline-package.md) | Базовый пакет безопасности |
| [security-audit-2026-07.md](./security-audit-2026-07.md) | Аудит приложения: сделано (код) и TODO (VPS) |
| [security-hardening-checklist.md](./security-hardening-checklist.md) | Полный чеклист |
