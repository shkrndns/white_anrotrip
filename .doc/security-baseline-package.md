# Security Baseline Package

> Этапный план безопасности: что внедрять сразу, что — по мере роста.

---

## Уровень 1: Сразу при деплое (обязательно)

- [x] HTTPS через Let's Encrypt (Caddy)
- [x] Honeypot в формах (`_hp` поле)
- [x] Rate-limit форм (in-memory, 5 запросов / 10 мин **per IP** — требует `security.allowedDomains` в Astro 7)
- [x] Данные форм не логируются (152-ФЗ)
- [x] Non-root пользователь в Docker (`astro`, UID 1001)
- [x] `.env` вне репозитория — только на VPS
- [ ] UFW: закрыть все порты кроме 22/80/443
- [ ] SSH: отключить password auth, только ключи
- [ ] fail2ban: защита SSH

## Уровень 2: При первом пиковом трафике

- [ ] Caddy rate-limit плагин (по IP на уровне прокси)
- [x] CSP заголовки (Content-Security-Policy) — `src/middleware.ts` (с `unsafe-inline` для виджетов)
- [x] HSTS — Caddyfile + middleware (`preload` в заголовке; подача на hstspreload.org — вручную)
- [x] X-Frame-Options: DENY — Caddyfile + middleware
- [x] Referrer-Policy: strict-origin-when-cross-origin — Caddyfile + middleware
- [x] Проверка Origin/Referer на POST `/api/*` — `src/lib/security.ts`
- [x] Безопасные ошибки API (без утечки SMTP/env) — `safeApiError()`
- [x] nodemailer ≥9.0.1 (GHSA-p6gq-j5cr-w38f)
- [ ] Cloudflare Bot Fight Mode
- [ ] fail2ban для HTTP 4xx

## Уровень 3: При работе с платёжными данными

- [ ] PCI DSS compliance (если будет приём платежей)
- [ ] Audit logging
- [ ] SIEM мониторинг
- [ ] Penetration testing

---

## CSP и security headers

**Реализовано** в двух слоях:

1. **`Caddyfile`** — HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, `-Server`
2. **`src/middleware.ts`** — полный CSP + дублирование базовых заголовков

> ⚠️ CSP содержит `script-src 'unsafe-inline'` — необходим для Nemo/Tourvisor и inline-скриптов Astro.  
> Дальнейшее ужесточение — через report-only и вынос скриптов в файлы. См. [security-audit-2026-07.md](./security-audit-2026-07.md).

---

## Связанные документы

| Документ | Содержание |
|---|---|
| [perimeter-edge-security.md](./perimeter-edge-security.md) | UFW, SSH, Cloudflare |
| [security-hardening-checklist.md](./security-hardening-checklist.md) | Полный чеклист с конфигами |
| [forms.md](./forms.md) | Защита форм (honeypot, rate-limit) |
| [security-audit-2026-07.md](./security-audit-2026-07.md) | Аудит приложения: сделано и TODO |
