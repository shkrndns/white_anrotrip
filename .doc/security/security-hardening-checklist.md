# Security Hardening: полный чеклист

> Готовые конфиги и пошаговый чеклист для Beget VPS.

---

## VPS: первый вход

```bash
# Обновить систему
apt update && apt upgrade -y

# Создать deploy-пользователя
adduser deploy
usermod -aG sudo deploy

# Скопировать SSH-ключ для deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## UFW

```bash
apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp   # SSH (нестандартный порт)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp    # HTTP/3
ufw enable
```

---

## SSH (/etc/ssh/sshd_config)

```
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
AllowUsers deploy
```

```bash
systemctl restart sshd
```

---

## fail2ban

```bash
apt install fail2ban -y

cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

---

## Docker (безопасность)

```bash
# Только deploy имеет доступ к Docker
usermod -aG docker deploy

# Не логировать данные форм (уже в коде)
# Healthcheck настроен в Dockerfile (каждые 30 сек)
```

---

## Caddy: security headers

```caddyfile
anrotrip.ru, www.anrotrip.ru {
    encode gzip
    trusted_proxies cloudflare

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }

    reverse_proxy app:4321
}
```

---

## Финальный чеклист

| Пункт | Статус |
|---|---|
| UFW настроен, порты закрыты | ⬜ |
| SSH: нестандартный порт | ⬜ |
| SSH: только ключи | ⬜ |
| SSH: root отключён | ⬜ |
| fail2ban запущен | ⬜ |
| Docker: non-root user | ✅ (в Dockerfile) |
| HTTPS работает | ⬜ |
| Security headers в Caddy | ⬜ |
| .env не в репозитории | ✅ |
| Honeypot в формах | ✅ |
| Rate-limit форм | ✅ |

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [perimeter-edge-security.md](../deploy/perimeter-edge-security.md) | DNS, Cloudflare |
| [security-baseline-package.md](./security-baseline-package.md) | Этапный план |
| [server-vps-stack-plan.md](../deploy/server-vps-stack-plan.md) | Деплой |
